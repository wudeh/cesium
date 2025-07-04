import * as Cesium from "cesium";

/**
 * 设置光照区域
 * @param {*} viewer 
 * @param {*} features 光照区域的经纬度
 */
export default function setLightArea(viewer, features) {
    const area = new Cesium.Entity({
        id: 1,
        polygon: {
        hierarchy: {
            // 定义多边形或孔外边界的线性环。
            // 其实就是地球上的暗面区域，要多大自己调试里面的数据
            positions: Cesium.Cartesian3.fromDegreesArray([
                50, 0, 100, 89, 160, 89, 160, 0,
            ]), 
            // 一组多边形层次结构，定义多边形中的孔。
            holes: [
            {
                positions: Cesium.Cartesian3.fromDegreesArray(features), //挖空区域
            },
            ],
        },
        // 填充多边形的材质
        material: Cesium.Color.BLACK.withAlpha(0.5),
        },
    });
    viewer.entities.add(area);
    return area;
}