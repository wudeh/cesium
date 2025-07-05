import * as Cesium from 'cesium'
// 定义绘制模式类型
type DrawingMode = 'Point' | 'Polyline' | 'Polygon' | 'Circle' | 'Rectangle'

// 扩展 Entity 类型以支持自定义属性
interface CustomEntity extends Cesium.Entity {
  positionData?: Cesium.Cartesian3 | Cesium.Cartesian3[]
  radius?: number
}

// 绘制配置参数接口
interface DrawOptions {
  removeLast?: boolean // 是否移除上一次绘制的图形，默认 true
}

// 全局变量声明
let drawHandler: Cesium.ScreenSpaceEventHandler | null = null
let activeShapePoints: Cesium.Cartesian3[] = []
let floatingPoint: CustomEntity | undefined | any
let activeShape: CustomEntity | undefined | any
let lastFeature: CustomEntity | undefined | any
const drawLayers: CustomEntity[] = []

/**
 * 手动绘制几何图形
 * @param viewer - Cesium 地图视图对象
 * @param drawingMode - 绘制模式：点/线/面/圆/矩形
 * @param options.removeLast - 是否清除上一个绘制
 * @param callback - 绘制完成回调函数
 * @returns 屏幕空间事件处理器
 */
export const draw = (
  viewer: any,
  drawingMode: DrawingMode,
  options: DrawOptions = { removeLast: true },
  callback?: (entity: CustomEntity) => void
): Cesium.ScreenSpaceEventHandler | undefined => {
  if (!viewer) return

  const { removeLast } = options
  // 配置场景参数
  viewer.scene.globe.depthTestAgainstTerrain = false
  viewer.enableCursorStyle = false
  viewer._element.style.cursor = 'crosshair'

  // 清理现有处理器
  if (drawHandler && !drawHandler.isDestroyed()) {
    drawHandler.destroy()
  }

  terminateShape()

  // 初始化事件处理器
  drawHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

  // 处理左键点击事件
  drawHandler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    const earthPosition = viewer.scene.pickPosition(event.position)

    if (Cesium.defined(earthPosition)) {
      if (drawingMode === 'Point') {
        // 点要素处理逻辑
        const finalPoint = createPoint(earthPosition)
        drawLayers.push(finalPoint)
        cleanupHandler()
        callback?.(finalPoint)
        return
      }

      if (!activeShapePoints.length) {
        // 初始化动态图形
        floatingPoint = createPoint(earthPosition, false)
        activeShapePoints.push(earthPosition)

        const dynamicPositions = new Cesium.CallbackProperty(() => {
          return drawingMode === 'Polygon' ? new Cesium.PolygonHierarchy(activeShapePoints) : activeShapePoints
        }, false)

        activeShape = drawShape(dynamicPositions)
      } else if (['Rectangle', 'Circle'].includes(drawingMode)) {
        // 矩形和圆特殊处理
        cleanupHandler()
        terminateShape(removeLast)
        return
      }

      activeShapePoints.push(earthPosition)
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  // 处理鼠标移动事件
  drawHandler.setInputAction((event: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
    if (floatingPoint) {
      const newPosition: any = viewer.scene.pickPosition(event.endPosition)
      if (Cesium.defined(newPosition)) {
        floatingPoint.position?.setValue(newPosition)
        activeShapePoints.pop()
        activeShapePoints.push(newPosition)
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  // 处理双击事件
  drawHandler.setInputAction(() => {
    cleanupHandler()
    activeShapePoints = activeShapePoints.slice(0, -2)
    terminateShape(removeLast)
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

  /** 清理事件处理器 */
  const cleanupHandler = () => {
    drawHandler?.destroy()
    viewer._element.style.cursor = 'default'
  }

  /** 终止当前图形绘制 */
  function terminateShape(removeLast?: boolean): void {
    removeLast && viewer.entities.remove(lastFeature!)

    if (activeShapePoints.length) {
      const finalShape = drawShape(activeShapePoints, true)
      drawLayers.push(finalShape)
      callback?.(finalShape)
    }

    viewer.entities.remove(floatingPoint!)
    viewer.entities.remove(activeShape!)
    floatingPoint = undefined
    activeShape = undefined
    activeShapePoints = []
  }

  /** 创建点要素 */
  function createPoint(worldPosition: Cesium.Cartesian3, isPoint = true): CustomEntity {
    const point = viewer.entities.add({
      position: worldPosition,
      point: {
        outlineWidth: isPoint ? 2 : 0,
        outlineColor: Cesium.Color.fromBytes(51, 153, 204),
        color: isPoint ? Cesium.Color.WHITE.withAlpha(0.5) : Cesium.Color.TRANSPARENT,
        pixelSize: 10
      }
    }) as CustomEntity

    point.positionData = worldPosition
    return point
  }

  /** 计算两点间距离（平面坐标系） */
  function calcRadius(point1: Cesium.Cartesian3, point2: Cesium.Cartesian3): number {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2))
  }

  /** 绘制几何图形 */
  function drawShape(positionData: Cesium.Cartesian3[] | Cesium.CallbackProperty, final = false): CustomEntity {
    let shape: any

    switch (drawingMode) {
      case 'Polyline':
        shape = viewer.entities.add({
          polyline: {
            positions: positionData as Cesium.Property,
            material: Cesium.Color.fromBytes(51, 153, 204)
          }
        }) as CustomEntity
        shape.positionData = positionData
        break

      case 'Polygon':
        shape = viewer.entities.add({
          polygon: {
            hierarchy: positionData as Cesium.Property,
            perPositionHeight: true,
            material: Cesium.Color.WHITE.withAlpha(0.5),
            outline: true,
            clampToGround: true, //贴地
            outlineColor: Cesium.Color.fromBytes(51, 153, 204)
          }
        }) as CustomEntity
        shape.positionData = positionData
        break

      case 'Circle': {
        const positions =
          positionData instanceof Cesium.CallbackProperty
            ? positionData.getValue(Cesium.JulianDate.now())
            : positionData

        const radius = calcRadius(positions[0], positions[positions.length - 1])
        const callbackRadius = new Cesium.CallbackProperty(
          () => calcRadius(positions[0], positions[positions.length - 1]),
          false
        )

        const cartographic = Cesium.Cartographic.fromCartesian(positions[0])!

        shape = viewer.entities.add({
          position: activeShapePoints[0],
          name: 'Circle',
          ellipse: {
            semiMinorAxis: callbackRadius,
            semiMajorAxis: callbackRadius,
            height: cartographic.height,
            material: Cesium.Color.WHITE.withAlpha(0.5),
            outline: true,
            outlineColor: Cesium.Color.fromBytes(51, 153, 204),
            outlineWidth: 1
          }
        }) as CustomEntity

        Object.assign(shape, { positionData: [positions[0]], radius })
        break
      }

      case 'Rectangle': {
        const positions =
          positionData instanceof Cesium.CallbackProperty
            ? positionData.getValue(Cesium.JulianDate.now())
            : positionData

        const cartographic = Cesium.Cartographic.fromCartesian(positions[0])!

        shape = viewer.entities.add({
          name: 'Rectangle',
          rectangle: {
            coordinates: new Cesium.CallbackProperty(() => Cesium.Rectangle.fromCartesianArray(positions), false),
            height: cartographic.height,
            material: Cesium.Color.WHITE.withAlpha(0.5),
            outline: true,
            outlineColor: Cesium.Color.fromBytes(51, 153, 204),
            outlineWidth: 1
          }
        }) as CustomEntity

        shape.positionData = positions
        break
      }
    }

    if (final) lastFeature = shape!
    return shape!
  }

  return drawHandler
}
