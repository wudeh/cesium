import * as Cesium from "cesium";

// 地球旋转
export function useRotate(viewer) {
  //每次旋转的弧度
    var angle = Cesium.Math.toRadians(Math.PI*0.15)
    //Cesium 中的时钟（viewer.clock）的 onTick 事件的监听器。该事件会在每一帧渲染时触发。
    viewer.clock.onTick.addEventListener(()=>{ 
        // 每一帧渲染时，相机会绕 z 轴（Cesium.Cartesian3.UNIT_Z）旋转angle 弧度。
        viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z,angle);
    });
}

/**
 * 添加点到 Cesium Viewer
 * @param {*} viewer cesium viewer 实例
 * @param {*} degree 经纬度数组
 * @param {*} color 点的颜色
 * @param {*} radius 点的半径
 * @param {*} clampToGround 是否贴地
 * @return {Cesium.Entity} 返回添加的点实体
 */
export function useAddPoint(viewer, degree, color = Cesium.Color.RED, radius = 5, clampToGround = true) {
    return viewer.entities.add({
        id: "point",
        name: "点",
        show: true,
        //点的具体参数
        position: Cesium.Cartesian3.fromDegrees(degree[0], degree[1], 0), // 使用经度和纬度创建位置，第三个参数为高度，这里设为0
        //点的颜色
        point: {
            // color,
            //点的半径
            pixelSize: radius,
            //点贴在地表
            clampToGround,
            //点的材质
            // material: color,
            // material: new Cesium.ImageMaterialProperty({
            //     image: "assets/images/icon1.png",
            //     repeat: new Cesium.Cartesian2(2, 2),
            // })
        },
    })
}


/**
 * 添加线到 Cesium Viewer
 * @param {*} viewer cesium viewer 实例
 * @param {*} degreesArray 经纬度数组
 * @param {*} color 线的颜色
 * @param {*} width 线的宽度
 * @param {*} clampToGround 是否贴地
 * @return {Cesium.Entity} 返回添加的线实体
 */
export function useAddLine(viewer, degreesArray, name = 'line', color = Cesium.Color.WHITE, width = 2, clampToGround = true) {
    return viewer.entities.add({
        id: name,
        name,
        show: true,
        //线的具体参数
        polyline: {
            //线的坐标
            positions: Cesium.Cartesian3.fromDegreesArray(degreesArray),
            //线的颜色
            color,
            //线的宽度
            width,
            
            //线贴在地表
            clampToGround,
            //线的材质
            material: color,
        },
    })
}

/**
 * 添加面到 Cesium Viewer
 * @param {*} viewer cesium viewer 实例
 * @param {*} degreesArray 经纬度数组
 * @param {*} color 面的颜色
 * @param {*} clampToGround 是否贴地
 * @return {Cesium.Entity} 返回添加的面实体
 */
export function useAddPolygon(viewer, degreesArray = [], ids = [], color = Cesium.Color.WHITE) {
    // 创建多边形几何实例
        const instance = degreesArray.map((item, index) => {
            return new Cesium.GeometryInstance({
                id: ids[index] || `PolygonGeometry-${index}`, // 使用传入的 id 或默认值
                name: `多边形-${index}`, // 设置名称
                geometry: new Cesium.PolygonGeometry({
                    polygonHierarchy: new Cesium.PolygonHierarchy(
                        Cesium.Cartesian3.fromDegreesArray(item.flat(Infinity)) // 将经纬度数组展平
                    )
                }),
            });
        });
        
        // 根据几何实例创建图元
        const primitive = instance.map(item => {
            return new Cesium.Primitive({
                geometryInstances: item,  //可以是实例数组
                appearance: new Cesium.MaterialAppearance({
                    material: Cesium.Material.fromType('Color', {
                        color: color // 设置材质颜色
                    }),
                })
            });
        })
        
        // 将图元添加到集合
        primitive.forEach(item => {
            viewer.scene.primitives.add(item)
        })
        
        return primitive;
}