import addhemisphere from "./addhemisphere.js";
import * as Cesium from "cesium"
 
var allPointEntities = [];
let viewer;
/**
 * 添加点扩散效果（ max 和 min 数值要相同才能是个圆形）
 * @param {*} outViewer 
 * @param {*} id 点的id，可以传信息
 * @param {*} params 经纬度数组
 * @param {*} max 竖向多大
 * @param {*} min 横向多大
 */
export const addPoint = (outViewer, id = 'point_spread',  params, max=2500, min=2500) => {
            viewer = outViewer;
           let entity = viewer.entities.add({
                id,
               position: Cesium.Cartesian3.fromDegrees( Number(params[0]), Number(params[1]), 0, ), // 点生成的位置
               /*point: {
                 color:Cesium.Color.fromCssColorString('#d93a2f'), // 点颜色
                 outlineColor: Cesium.Color.fromCssColorString("#d93a2f"), // 点边框颜色
                 pixelSize: 10, // 点大小
                 outlineWidth: 2, // 点边框大小
                 disableDepthTestDistance: Number.POSITIVE_INFINITY, // 受地形遮挡
                 heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 生成在地形表面
               },*/
               ellipse: {
                   semiMinorAxis: max,
                   semiMajorAxis: min,
                   material: addhemisphere.addCircle(viewer, {
                       color: new Cesium.Color(1, 0, 0, 0.8),
                       speed: 8.0,
                       count: 3,
                       gradient: 0.8
                   })
               },
               label: {
                   text:'',
                   // horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                   font: '19px Helvetica',
                   horizontalOrigin:Cesium.HorizontalOrigin.LEFT ,
                   verticalOrigin: Cesium.VerticalOrigin.CENTER,
                   // style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                   // pixelOffset: pixelOffset,
                   // 设置文字的偏移量
                   pixelOffset: new Cesium.Cartesian2(16, 0),
               },
           });
           allPointEntities.push(entity)
   }
 
//清除点
export const removePoint = () => {
    if(allPointEntities && allPointEntities.length > 0) {
        allPointEntities.forEach((item)=>{
            viewer.entities.remove(item);
        })
    }
    allPointEntities=[];
}