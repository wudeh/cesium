import * as Cesium from 'cesium';
// 雷达扫描效果

 
/**怎么用下面的类**/
// import Radar from "./lib/radar.js";
// let radar=null;
// // 添加立体雷达扫描
// export const addRadarScan=(data)=> {
//     // 创建三个不同位置的雷达
//     radar = new Radar(viewer, {
//         longitude: data.longitude,//经度
//         latitude: data.latitude,//纬度
//         radius: data.radius, // 雷达半径 单位米
//         rotationSpeed: data.rotationSpeed//速度
//     })
// }
// // 删除立体雷达扫描
// export const removeRadarScan=()=>{
//   if(radar){
//       // 删除雷达半球实体
//       viewer.entities.remove(radar.wallEntity);
//       // 删除雷达扫描墙实体
//       viewer.entities.remove(radar.radarEntity);
//   }
// }

class Radar {
  constructor(viewer, options = {}) {
    this.viewer = viewer;
    this.longitude = options.longitude || 110;
    this.latitude = options.latitude || 30;
    this.radius = options.radius || 15000;
    this.color = options.color || Cesium.Color.ORANGE.withAlpha(0.4);
    this.rotationSpeed = options.rotationSpeed || 2; // 每次旋转的度数
    this.maxHeight = options.maxHeight || 15000;
 
    this.heading = 0;
    this.positionArr = [];
    this.wallEntity = null;
    this.radarEntity = null;
    this.rotationInterval = null;
 
    this.init();
  }
 
  init() {
    // 创建雷达半球
    this.radarEntity = this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(this.longitude, this.latitude, 0),
      ellipsoid: {
        radii: new Cesium.Cartesian3(this.radius, this.radius, this.radius),
        maximumCone: Cesium.Math.toRadians(90),
        material: this.color,
        outline: true,
        outlineColor: this.color.withAlpha(0.8),
        subdivisions: 64,
        stackPartitions: 32,
        slicePartitions: 32,
      },
    });
 
    // 初始化动态墙
    this.updatePositionArray();
    this.createWall();
    this.startRotation();
  }
 
  calcPoints(x1, y1, radius, heading) {
    const m = Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(x1, y1)
    );
    const rx = radius * Math.cos((heading * Math.PI) / 180.0);
    const ry = radius * Math.sin((heading * Math.PI) / 180.0);
    const translation = Cesium.Cartesian3.fromElements(rx, ry, 0);
    const d = Cesium.Matrix4.multiplyByPoint(
      m,
      translation,
      new Cesium.Cartesian3()
    );
    const c = Cesium.Cartographic.fromCartesian(d);
    const x2 = Cesium.Math.toDegrees(c.longitude);
    const y2 = Cesium.Math.toDegrees(c.latitude);
    return this.computeCirclularFlight(
      x1,
      y1,
      x2,
      y2,
      0,
      90,
      radius,
      this.maxHeight
    );
  }
 
  computeCirclularFlight(x1, y1, x2, y2, fx, angle, radius, maxHeight) {
    let positionArr = [];
    positionArr.push(x1, y1, 0);
    for (let i = fx; i <= fx + angle; i++) {
      let h = radius * Math.sin((i * Math.PI) / 180.0);
      if (h > maxHeight) h = maxHeight;
      let r = Math.cos((i * Math.PI) / 180.0);
      let x = (x2 - x1) * r + x1;
      let y = (y2 - y1) * r + y1;
      positionArr.push(x, y, h);
    }
    return positionArr;
  }
 
  updatePositionArray() {
    this.positionArr = this.calcPoints(
      this.longitude,
      this.latitude,
      this.radius,
      this.heading
    );
  }
 
  createWall() {
    this.wallEntity = this.viewer.entities.add({
      wall: {
        positions: new Cesium.CallbackProperty(() => {
          return Cesium.Cartesian3.fromDegreesArrayHeights(this.positionArr);
        }, false),
        material: this.color.withAlpha(0.9),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0.0,
          10.5e6
        ),
        outline: false,
      },
    });
  }
 
  startRotation() {
    this.rotationInterval = setInterval(() => {
      this.heading = (this.heading + this.rotationSpeed) % 360;
      this.updatePositionArray();
    }, 50);
  }
 
  // 销毁雷达实例
  destroy() {
    if (this.radarEntity) {
      this.viewer.entities.remove(this.radarEntity);
    }
    if (this.wallEntity) {
      this.viewer.entities.remove(this.wallEntity);
    }
 
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
  }
}
 
export default Radar;