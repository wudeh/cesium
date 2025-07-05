import * as Cesium from "cesium"

// 圆形域分析，鼠标左键点击，确定中心点、半径，显示海拔、半径、经纬度
export default class analyzingVisibilityFn {
  handler = null
  handlerDestroy = false
  pointsEntity = []
  linesEntity = []
  labelsEntity = []
  // 是否退出分析
  exitRemove = false

  constructor(){
    
  }

  start(viewer) {
    this.exitRemove = false;
    let points = [];
    let lineEntity = null;
    let labelEntity = null;
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    this.handlerDestroy = false
    this.handler.setInputAction(async (click) => {
      let cartesian = viewer.scene.pickPosition(click.position);
      if (!cartesian) return;
 
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      //注意：必须有地形文件才能进行分分析！！！！！！  viewer.terrainProvider
      let terrainSample = await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [cartographic]);
      let groundHeight = terrainSample[0].height;
      let groundCartesian = Cesium.Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        groundHeight
      );
      // 绘制点
      let pointEntity = viewer.entities.add({
        position: groundCartesian,
        point: {
          pixelSize: 10,
          color: Cesium.Color.MAGENTA,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
      this.pointsEntity.push(pointEntity);
      points.push({ cartesian: groundCartesian, cartographic, groundHeight, entity: pointEntity });
 
      // 连线
      if (points.length === 2) {
        if (lineEntity) viewer.entities.remove(lineEntity);
        lineEntity = viewer.entities.add({
          polyline: {
            positions: [points[0].cartesian, points[1].cartesian],
            width: 2,
            material: Cesium.Color.YELLOW,
            depthFailMaterial: Cesium.Color.YELLOW
          }
        });
        this.linesEntity.push(lineEntity);
      }
 
      // 分析
      if (points.length === 2) {
        this.handler.destroy();
        this.handlerDestroy = true
        // 计算半径
        let radius = Cesium.Cartesian3.distance(points[0].cartesian, points[1].cartesian);
        let originCartographic = points[0].cartographic;
        let groundHeight = points[0].groundHeight;
        let segments = 90; //线的条数
        let steps = 50;//线的分段数
 
        for (let i = 0; i < segments; i++) {
          if (this.exitRemove) {
            return;
          }
          let angle = 2 * Math.PI * i / segments;
          let dx = Math.cos(angle) * radius;
          let dy = Math.sin(angle) * radius;
 
          // 计算终点经纬度
          let destCartographic = new Cesium.Cartographic(
            originCartographic.longitude + dx / (6378137 * Math.cos(originCartographic.latitude)),
            originCartographic.latitude + dy / 6378137,
            0
          );
 
          let samplePoints = [];
          for (let j = 1; j <= steps; j++) {
            if (this.exitRemove) {
              return;
            }
            let frac = j / steps;
            let lng = Cesium.Math.lerp(originCartographic.longitude, destCartographic.longitude, frac);
            let lat = Cesium.Math.lerp(originCartographic.latitude, destCartographic.latitude, frac);
            samplePoints.push(new Cesium.Cartographic(lng, lat, 0));
          }
          samplePoints.unshift(originCartographic);
 
          let terrainSamples = await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, samplePoints);
 
          let visibleLine = [];
          let invisibleLine = [];
          let blocked = false;
 
          for (let k = 0; k < terrainSamples.length; k++) {
            if (this.exitRemove) {
              return;
            }
            let frac = k / (terrainSamples.length - 1);
            let expectedHeight = groundHeight + frac * (terrainSamples[terrainSamples.length - 1].height - groundHeight);
            let pointCartesian = Cesium.Cartesian3.fromRadians(
              samplePoints[k].longitude,
              samplePoints[k].latitude,
              terrainSamples[k].height
            );
            if (!blocked && terrainSamples[k].height <= expectedHeight) {
              visibleLine.push(pointCartesian);
            } else {
              blocked = true;
              invisibleLine.push(pointCartesian);
            }
          }
          if (visibleLine.length > 1) {
            let entity = viewer.entities.add({
              polyline: {
                positions: visibleLine,
                width: 2,
                material: Cesium.Color.GREEN
              }
            });
            this.linesEntity.push(entity);
          }
          if (invisibleLine.length > 1) {
            let entity = viewer.entities.add({
              polyline: {
                positions: invisibleLine,
                width: 2,
                material: Cesium.Color.RED
              }
            });
            this.linesEntity.push(entity);
          }
          viewer.scene.requestRender();
        }
 
        // 清理半径点和连线，只保留中心点
        if (points[1].entity) viewer.entities.remove(points[1].entity);
        if (lineEntity) viewer.entities.remove(lineEntity);
 
        // 弹框内容
        let center = points[0];
        let longitude = Cesium.Math.toDegrees(center.cartographic.longitude).toFixed(6);
        let latitude = Cesium.Math.toDegrees(center.cartographic.latitude).toFixed(6);
        let info = `海拔高: ${center.groundHeight.toFixed(2)}m\n半径: ${(radius / 1000).toFixed(2)}km\n经度: ${longitude}\n纬度: ${latitude}`;
        labelEntity = viewer.entities.add({
          position: center.cartesian,
          label: {
            text: info,
            font: '16px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: true,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            pixelOffset: new Cesium.Cartesian2(200, 0)
          }
        });
        this.labelsEntity.push(labelEntity);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
  stop(){
    if(this.handler){
      this.handler.destroy();
      this.handler = null
    }
  }
  clearAll(viewer) {
    this.exitRemove = true;
    if (this.handler) {
      if(!this.handlerDestroy) this.handler.destroy();
      this.handler = null
      this.pointsEntity.forEach(item => {
        viewer.entities.remove(item);
      })
      this.pointsEntity = [];
      this.linesEntity.forEach(item => {
        viewer.entities.remove(item);
      })
      this.linesEntity = [];
      this.labelsEntity.forEach(item => {
        viewer.entities.remove(item);
      })
      this.labelsEntity = [];
    }
  }
};