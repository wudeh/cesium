import * as Cesium from 'cesium';

// 屏幕坐标 转 经纬度
export default function positionToCood(viewer, position) {
    let cartesian = viewer.scene.pickPosition(position);
    // const point = _this.cartesian3ToWGS84(cartesian);
    // console.log('点击处的坐标为：',point)
    let pickingEntity = viewer.scene.pick(position); //获取三维坐标和点击的实体对象
    // console.log('entity===>',pickingEntity)
    let coord = null;
    //转经纬度坐标
    if (pickingEntity && pickingEntity.id && pickingEntity.id.position) {
        cartesian = pickingEntity.id.position.getValue();
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let lontable = Number(
            Cesium.Math.toDegrees(cartographic.longitude).toFixed(7),
        );
        let lattable = Number(
            Cesium.Math.toDegrees(cartographic.latitude).toFixed(7),
        );
        let height = cartographic.height;
        coord = { longitude: lontable, latitude: lattable, height: height };
    } else {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let lontable =
            //@ts-ignore
            Cesium.Math.toDegrees(cartographic.longitude).toFixed(5) * 1;
        let lattable =
            //@ts-ignore
            Cesium.Math.toDegrees(cartographic.latitude).toFixed(5) * 1;
        let height = cartographic.height;
        coord = { longitude: lontable, latitude: lattable, height: height };
    }
    return coord;   
}