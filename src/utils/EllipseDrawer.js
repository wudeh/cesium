import * as Cesium from "cesium"
/**
 * 椭圆绘制
 * 功能：绘制椭圆，鼠标点击确认第一个点，鼠标再次点击确认第一个点的半轴，鼠标再次点击确认第二个点的半轴 完成绘制
 * 是根据鼠标的点击位置，计算出椭圆的中心点，半轴1，半轴2，然后绘制椭圆
 * 根据鼠标点击位置，两个半轴的长度，计算出椭圆的角度，然后绘制椭圆 
 */
const EllipseDrawer = {
  ellipseAll: [],
  handler: null,
  drawStep: 0,
  // 半轴1
  semiAxis1: 0,
  // 半轴2
  semiAxis2: 0,
  // 点击位第一个坐标点，又来确认倾斜角度
  firstPoint: null,
  viewer: null,
  tempEllipse: null,
  start(viewer) {
    this.viewer = viewer
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    // let ellipse: Cesium.Entity | null = null;
    let centerPoint = null;
    let isDrawing = false;
    let semiMajorAxis = 0;
    let semiMinorAxis = 0;
    this.handler.setInputAction((click) => {
      const cartesian = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid);
      console.log("cartesian", cartesian)
      if (!cartesian) return;
      // switch(this.drawStep){
      //   case 0:
      //     centerPoint = cartesian;
      //     this.tempEllipse = this.viewer.entities.add({
      //       position: centerPoint,
      //       ellipse: {
      //         semiMajorAxis: new Cesium.CallbackProperty(() => semiMajorAxis, false),
      //         semiMinorAxis: new Cesium.CallbackProperty(() => semiMinorAxis, false),
      //         material: Cesium.Color.YELLOW.withAlpha(0.5),
      //         outline: true,
      //         clampToGround: true, //贴地
      //         outlineColor: Cesium.Color.YELLOW,
      //         // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      //       }
      //     });
      //     this.drawStep++;
      //     break;
      //   case 1:
 
      //     break;
      // }
      if (!isDrawing) {
        // 第一次点击，设置中心点
        centerPoint = cartesian;
        isDrawing = true;
 
        // 创建临时椭圆用于实时预览
        this.tempEllipse = this.viewer.entities.add({
          position: centerPoint,
          ellipse: {
            semiMajorAxis: new Cesium.CallbackProperty(() => semiMajorAxis, false),
            semiMinorAxis: new Cesium.CallbackProperty(() => semiMinorAxis, false),
            material: Cesium.Color.YELLOW.withAlpha(0.5),
            outline: true,
            clampToGround: true, //贴地
            outlineColor: Cesium.Color.YELLOW,
            // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          }
        });
      } else {
        
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
 
    // 鼠标移动 - 实时更新椭圆大小
    this.handler.setInputAction((movement) => {
      if (isDrawing && centerPoint) {
        const cartesian = this.viewer.camera.pickEllipsoid(movement.endPosition, this.viewer.scene.globe.ellipsoid);
        if (cartesian) {
          const distance = Cesium.Cartesian3.distance(centerPoint, cartesian);
          semiMajorAxis = distance;
          semiMinorAxis = distance * 0.6; // 短轴为长轴的60%
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    // 鼠标右键 - 取消绘制
    this.handler.setInputAction((click) => {
      const cartesian = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid);
      // 第二次点击，完成椭圆绘制
        const distance = Cesium.Cartesian3.distance(centerPoint, cartesian);
        semiMajorAxis = distance;
        semiMinorAxis = distance * 0.6; // 默认短轴为长轴的60%
 
        // 移除临时椭圆
        this.viewer.entities.remove(this.tempEllipse);
 
        // 创建最终椭圆
        const finalEllipse = this.viewer.entities.add({
          name: 'ellipse',
          position: centerPoint,
          ellipse: {
            semiMajorAxis: semiMajorAxis,
            semiMinorAxis: semiMinorAxis,
            material: Cesium.Color.RED.withAlpha(0.3),
            outline: true,
            outlineColor: Cesium.Color.RED,
            outlineWidth: 2,
            height: 0,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          }
        });
 
        this.ellipseAll.push(finalEllipse);
 
        // 重置状态
        centerPoint = null;
        isDrawing = false;
        this.tempEllipse = null;
        this.stop();
      if (this.tempEllipse) {
        this.viewer.entities.remove(this.tempEllipse);
      }
      this.stop();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  },
  stop() {
    if (this.handler) {
      this.handler.destroy();
      this.handler = null;
      this.drawStep = 0;
      if(this.tempEllipse){
        this.viewer.entities.remove(this.tempEllipse);
      }
    }
  },
  clear(viewer) {
    this.ellipseAll.forEach((ellipse) => viewer.entities.remove(ellipse));
    this.ellipseAll = [];
    this.stop();
  }
}

export default EllipseDrawer;