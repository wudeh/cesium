import * as Cesium from "cesium"

let measureFeature_line = []
let measureFeature_polygon = []

// 测线距离
export function measureLineSpace() {
      var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      // 取消双击事件-追踪该位置
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      )
 
      handler = new Cesium.ScreenSpaceEventHandler(
        viewer.scene._imageryLayerCollection
      )
      var positions = []
      var poly = null
      var distance = 0
      var cartesian = null
      var floatingPoint
 
      handler.setInputAction(function (movement) {
        // cartesian = viewer.scene.pickPosition(movement.endPosition);
        const ray = viewer.camera.getPickRay(movement.endPosition)
        cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        // cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
        if (positions.length >= 2) {
          if (!Cesium.defined(poly)) {
            poly = new PolyLinePrimitive(positions)
          } else {
            positions.pop()
            // cartesian.y += (1 + Math.random());
            positions.push(cartesian)
          }
          distance = getSpaceDistance(positions)
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
 
      handler.setInputAction(function (movement) {
        // cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
        // cartesian = viewer.scene.pickPosition(movement.position);
        const ray = viewer.camera.getPickRay(movement.position)
        cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        if (positions.length == 0) {
          positions.push(cartesian.clone())
        }
        positions.push(cartesian)
        // 在三维场景中添加Label
        //   var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        var textDisance
        if (distance > 1000) {
          textDisance = (distance / 1000).toFixed(2) + 'km'
        } else {
          textDisance = distance + 'm'
        }
        
        floatingPoint = viewer.entities.add({
          name: '空间直线距离',
          // position: Cesium.Cartesian3.fromDegrees(cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180,cartographic.height),
          position: positions[positions.length - 1],
          point: {
            pixelSize: 5,
            color: Cesium.Color.WHITE,
            // outlineColor: new Cesium.Color(1, 0, 0, 1),
            outlineColor: Cesium.Color.DEEPSKYBLUE,
            outlineWidth: 3
          },
          label: {
            text: textDisance,
            font: '16px sans-serif',
            fillColor: Cesium.Color.DARKORANGE,
            // style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            // outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(20, -20)
          }
        })
        measureFeature_line.push(floatingPoint)
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
 
      handler.setInputAction(function (movement) {
        handler.destroy() // 关闭事件句柄
        positions.pop() // 最后一个点无效
        // viewer.entities.remove(floatingPoint);
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
 
      var PolyLinePrimitive = (function () {
        function _(positions) {
          this.options = {
            name: '直线',
            polyline: {
              show: true,
              positions: [],
              material: new Cesium.Color(0, 124 / 255, 247 / 255, 1),
              // material: Cesium.Color.CHARTREUSE,
              width: 3,
              clampToGround: true
            }
          }
          this.positions = positions
          this._init()
        }
 
        _.prototype._init = function () {
          var _self = this
          var _update = function () {
            return _self.positions
          }
          // 实时更新polyline.positions
          this.options.polyline.positions = new Cesium.CallbackProperty(
            _update,
            false
          )
          const line = viewer.entities.add(this.options)
          measureFeature_line.push(line)
        }
 
        return _
      })()
      console.log(measureFeature_line, 'measureFeature_line')
 
      // 空间两点距离计算函数
      function getSpaceDistance(positions) {
        var distance = 0
        for (var i = 0; i < positions.length - 1; i++) {
          var point1cartographic = Cesium.Cartographic.fromCartesian(
            positions[i]
          )
          var point2cartographic = Cesium.Cartographic.fromCartesian(
            positions[i + 1]
          )
          /** 根据经纬度计算出距离**/
          var geodesic = new Cesium.EllipsoidGeodesic()
          geodesic.setEndPoints(point1cartographic, point2cartographic)
          var s = geodesic.surfaceDistance
          // console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
          // 返回两点之间的距离
          s = Math.sqrt(
            Math.pow(s, 2) +
              Math.pow(point2cartographic.height - point1cartographic.height, 2)
          )
          distance = distance + s
        }
        return distance.toFixed(2)
      }
    }
// 测面的面积
export function measureAreaSpace() {
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    // 取消双击事件-追踪该位置
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    )
    // 鼠标事件
    handler = new Cesium.ScreenSpaceEventHandler(
    viewer.scene._imageryLayerCollection
    )
    var positions = []
    var tempPoints = []
    var polygon = null
    var cartesian = null
    var floatingPoint

    handler.setInputAction(function (movement) {
    const ray = viewer.camera.getPickRay(movement.endPosition)
    cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    // cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
    if (positions.length >= 2) {
        if (!Cesium.defined(polygon)) {
        polygon = new PolygonPrimitive(positions)
        } else {
        positions.pop()
        positions.push(cartesian)
        }
    }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    handler.setInputAction(function (movement) {
    const ray = viewer.camera.getPickRay(movement.position)
    cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    // cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
    if (positions.length == 0) {
        positions.push(cartesian.clone())
    }
    // positions.pop();
    positions.push(cartesian)
    // 在三维场景中添加点
    var cartographic = Cesium.Cartographic.fromCartesian(
        positions[positions.length - 1]
    )
    var longitudeString = Cesium.Math.toDegrees(cartographic.longitude)
    var latitudeString = Cesium.Math.toDegrees(cartographic.latitude)
    var heightString = cartographic.height
    tempPoints.push({
        lon: longitudeString,
        lat: latitudeString,
        hei: heightString
    })
    floatingPoint = viewer.entities.add({
        name: '多边形面积',
        position: positions[positions.length - 1],
        point: {
        pixelSize: 5,
        color: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.DEEPSKYBLUE,
        // outlineColor: new Cesium.Color(1, 0, 0, 1),
        // color: Cesium.Color.RED,
        // outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3
        // pixelSize: 5,
        // color: Cesium.Color.RED,
        // outlineColor: Cesium.Color.WHITE,
        // outlineWidth: 2,
        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
    })
    measureFeature_polygon.push(floatingPoint)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    handler.setInputAction(function (movement) {
    handler.destroy()
    positions.pop()
    // debugger
    var polyCenter = Cesium.BoundingSphere.fromPoints(positions).center
    var textArea = getArea(tempPoints) + 'km²'
    const _label = viewer.entities.add({
        name: '多边形面积',
        position: polyCenter,
        // position: positions[positions.length - 1],
        label: {
        text: textArea,
        font: '16px sans-serif',
        // fillColor: new Cesium.Color(255 / 255, 99 / 255, 25 / 255, 1),
        fillColor: Cesium.Color.DARKORANGE,
        // style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        // outlineWidth: 2,
        // verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        // pixelOffset: new Cesium.Cartesian2(20, -40),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
    })
    measureFeature_polygon.push(_label)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    var radiansPerDegree = Math.PI / 180.0 // 角度转化为弧度(rad)
    var degreesPerRadian = 180.0 / Math.PI // 弧度转化为角度

    // 计算多边形面积
    function getArea(points) {
    var res = 0
    // 拆分三角曲面
    for (var i = 0; i < points.length - 2; i++) {
        var j = (i + 1) % points.length
        var k = (i + 2) % points.length
        var totalAngle = Angle(points[i], points[j], points[k])

        var dis_temp1 = distance(positions[i], positions[j])
        var dis_temp2 = distance(positions[j], positions[k])
        res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle))
        console.log(res)
    }

    return (res / 1000000.0).toFixed(4)
    }

    /* 角度 */
    function Angle(p1, p2, p3) {
    var bearing21 = Bearing(p2, p1)
    var bearing23 = Bearing(p2, p3)
    var angle = bearing21 - bearing23
    if (angle < 0) {
        angle += 360
    }
    return angle
    }
    /* 方向 */
    function Bearing(from, to) {
    var lat1 = from.lat * radiansPerDegree
    var lon1 = from.lon * radiansPerDegree
    var lat2 = to.lat * radiansPerDegree
    var lon2 = to.lon * radiansPerDegree
    var angle = -Math.atan2(
        Math.sin(lon1 - lon2) * Math.cos(lat2),
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
    )
    if (angle < 0) {
        angle += Math.PI * 2.0
    }
    angle = angle * degreesPerRadian // 角度
    return angle
    }

    var PolygonPrimitive = (function () {
    function _(positions) {
        this.options = {
        name: '多边形',
        polygon: {
            hierarchy: [],
            // perPositionHeight : true,
            material: new Cesium.Color(0, 124 / 255, 247 / 255, 0.5)
            // material: Cesium.Color.GREEN.withAlpha(0.5)
            // heightReference:20000
        }
        }

        this.hierarchy = { positions }
        this._init()
    }

    _.prototype._init = function () {
        var _self = this
        var _update = function () {
        return _self.hierarchy
        }
        // 实时更新polygon.hierarchy
        this.options.polygon.hierarchy = new Cesium.CallbackProperty(
        _update,
        false
        )
        const _polygon = viewer.entities.add(this.options)
        measureFeature_polygon.push(_polygon)
    }

    return _
    })()

    function distance(point1, point2) {
    var point1cartographic = Cesium.Cartographic.fromCartesian(point1)
    var point2cartographic = Cesium.Cartographic.fromCartesian(point2)
    /** 根据经纬度计算出距离**/
    var geodesic = new Cesium.EllipsoidGeodesic()
    geodesic.setEndPoints(point1cartographic, point2cartographic)
    var s = geodesic.surfaceDistance
    // console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
    // 返回两点之间的距离
    s = Math.sqrt(
        Math.pow(s, 2) +
        Math.pow(point2cartographic.height - point1cartographic.height, 2)
    )
    return s
    }
}
// 清除
export function clearMeasureFeature() {
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    if (measureFeature_line.length) {
    measureFeature_line.forEach(item => {
        viewer.entities.remove(item)
    })
    measureFeature_line = []
    }
    if (measureFeature_polygon.length) {
    measureFeature_polygon.forEach(item => {
        viewer.entities.remove(item)
    })
    measureFeature_polygon = []
    }
}