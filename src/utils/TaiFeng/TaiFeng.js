import { taifengData } from './taifengData';
import taifengImg from '@/assets/images/taifengImg.png';
import * as Cesium from 'cesium';
import jingjiexian24 from './24小时警示线.json';
import jingjiexian48 from './48小警示线.json';

let viewer;
// 绘制线的方法
const lineAllEntity = [];
const drawLine = (params, type, labelName, colorStr) => {
  const windPowerArea = [...params.features];
  let arr = [];
  windPowerArea.forEach((item, i) => {
    let coordinatesArr = [...item.geometry.coordinates];
    coordinatesArr.push(0);
    arr = arr.concat(coordinatesArr);
  });
  let line = null;
  if (!type) {
    line = viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(arr),
        arcType: Cesium.ArcType.NONE,
        width: 2,
        material: new Cesium.PolylineOutlineMaterialProperty({
          color: colorStr
            ? Cesium.Color.fromCssColorString(colorStr)
            : Cesium.Color.fromCssColorString('#F8FA00'),
        }),
        depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
          color: colorStr
            ? Cesium.Color.fromCssColorString(colorStr)
            : Cesium.Color.fromCssColorString('#F8FA00'),
        }),
      },
    });
    lineAllEntity.push(line);
  } else {
    line = viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(arr),
        arcType: Cesium.ArcType.NONE,
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({
          color: colorStr
            ? Cesium.Color.fromCssColorString(colorStr)
            : Cesium.Color.fromCssColorString('#F8FA00'),
          dashLength: 30, //短划线长度
          dashWidth: 6,
        }),
        depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
          color: colorStr
            ? Cesium.Color.fromCssColorString(colorStr)
            : Cesium.Color.fromCssColorString('#F8FA00'),
        }),
      },
    });
    lineAllEntity.push(line);
  }
 
 
};
// 删除线
const removeLine = async () => {
  // debugger;
  if (lineAllEntity && lineAllEntity.length > 0) {
    lineAllEntity.forEach((item) => {
      viewer.entities.remove(item);
    });
  }
  lineAllEntity.length=0;
};
// 添加label
let labelEntitleAll = [];
const addLabelMehods = (labelName, pointData, height) => {
  const labelEntities = viewer.entities.add({
    name: labelName,
    position: Cesium.Cartesian3.fromDegrees(pointData[0], pointData[1], height),
    label: {
      //文字标签
      text: labelName,
      font: '12pt Source Han Sans CN',
      // 字体颜色
      fillColor: new Cesium.Color(0.1, 0.8, 0.95, 1),
      // 背景颜色
      backgroundColor: Cesium.Color.gray,
      // 是否显示背景颜色
      showBackground: true,
      // label样式
      style: Cesium.LabelStyle.FILL,
      outlineWidth: 2,
      // 垂直位置
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      // 水平位置
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      // 偏移
      pixelOffset: new Cesium.Cartesian2(30, 0),
    },
  });
  labelEntitleAll.push(labelEntities);
};
// 删除label
const removeLabelMehods = () => {
  if (labelEntitleAll && labelEntitleAll.length > 0) {
    labelEntitleAll.forEach((item) => {
      viewer.entities.remove(item);
    });
  }
  labelEntitleAll = [];
};
// 存储创建的实体  方便清除
const pineAll = [];
const pointAll = [];
let preUpdateHandler = null;
const selectAll = [];
let trackTaiFeng = false;
// 绘画台风轨迹及计算飞行时间
const typhoonFlytoPath = async (viewer, positions, typhoonName) => {
  // 允许飞行动画
  viewer.clock.shouldAnimate = true;
  // 设定模拟时间的界限
  const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
  const stop = Cesium.JulianDate.addSeconds(start, positions.length, new Cesium.JulianDate());
 
  viewer.clock.startTime = start.clone();
  viewer.clock.stopTime = stop.clone();
  viewer.clock.currentTime = start.clone();
  // viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //末尾循环
  // 飞行速度，值越大速度越快，multiplier为0停止移动
  viewer.clock.multiplier = 5;
  // viewer.timeline.zoomTo(start, stop);
 
  // 计算飞行时间和位置
  const property = await computeFlight(start, positions);
 
  let rotation = Cesium.Math.toRadians(30);
 
  function getRotationValue() {
    rotation += -0.03;
    return rotation;
  }
 
  const typhoonEntity = viewer.entities.add({
    name: '台风路径',
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: start,
        stop: stop,
      }),
    ]),
    position: property,
    orientation: new Cesium.VelocityOrientationProperty(property), // 根据位置移动自动计算方向
    ellipse: {
      semiMinorAxis: 105000.0,
      semiMajorAxis: 105000.0,
      height: 100.0,
      fill: true,
      outlineWidth: 5,
      outline: false,
      rotation: new Cesium.CallbackProperty(getRotationValue, false),
      stRotation: new Cesium.CallbackProperty(getRotationValue, false),
      material: new Cesium.ImageMaterialProperty({
        image: taifengImg,
        transparent: true,
      }),
    },
    point: {
      pixelSize: 10,
      color: Cesium.Color.TRANSPARENT,
      outlineColor: Cesium.Color.TRANSPARENT,
      outlineWidth: 4,
    },
    label: {
      text: typhoonName,
      font: '18px sans-serif',
      pixelOffset: new Cesium.Cartesian2(0.0, 50),
    },
    path: {
      resolution: 1,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.9,
        color: Cesium.Color.YELLOW,
      }),
      width: 6,
    },
  });
  pineAll.push(typhoonEntity);
  // 设置飞行视角
  viewer.trackedEntity = undefined;
  if(trackTaiFeng){
    viewer.flyTo(typhoonEntity, {
        duration: 2,
        offset: {
        height: 900000,
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90),
        range: 2000000,
        },
    });
  }
  
  const oldItem = [];
  let num = 0;
  // 飞行视角追踪
  preUpdateHandler = function (event) {
    
    if (typhoonEntity) {
      const center = typhoonEntity.position.getValue(viewer.clock.currentTime);
      const hpr = new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0.0),
        Cesium.Math.toRadians(-90),
        2000000,
      );
      if (center) {
        // 单个坐标
        const cartographic = Cesium.Cartographic.fromCartesian(center);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const lng = Cesium.Math.toDegrees(cartographic.longitude);
        const alt = cartographic.height;
        selectAll.forEach((item) => {
          if (Number(item.x) == lat.toFixed(1) && Number(item.y) == lng.toFixed(1)) {
            if (oldItem.length > 0) {
              if (
                (oldItem[0] != Number(item.x) && oldItem[1] == Number(item.y)) ||
                (oldItem[0] == Number(item.x) && oldItem[1] != Number(item.y)) ||
                (oldItem[0] != Number(item.x) && oldItem[1] != Number(item.y))
              ) {
                oldItem[0] = Number(item.x);
                oldItem[1] = Number(item.y);
              // 判断是否是最后一个点
              if((selectAll[selectAll.length-1].x==oldItem[0])&&(selectAll[selectAll.length-1].y==oldItem[1])){
                // 清除台风飞行飞行跟踪
                if (preUpdateHandler) {
                  viewer.scene.preUpdate.removeEventListener(preUpdateHandler);
                }
                // 需要延迟0.5秒取消锁定视角,确保已经清除跟踪视角
               setTimeout(()=>{
                 // 取消视角锁定
                 viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
                 viewer.trackedEntity = undefined;
               },500)
              }
                // console.log('进来啦1111', item);
                num++;
                if (num < pointAll.length) {
                  pointAll[num].label.text =
                    '风速' +
                    item['风速'] +
                    'm/s \n' +
                    item['日期'] +
                    ' ' +
                    item['时间'];
                }
              }
            } else {
              oldItem[0] = Number(item.x);
              oldItem[1] = Number(item.y);
              // console.log('进来啦222', item);
              if (num < pointAll.length) {
                pointAll[num].label.text =
                  '风速' + item['风速'] + '\n ' + item['日期'] +' ' + item['时间'];
              }
            }
            // console.log("点啊",item);
 
            // pointAll[0].label.text='8888888';
            // 思路 :
            // 1.根据给点加个自定义坐标 坐标内容为 它的经纬度
            // 2.获取它的自定义坐标 来跟现在的item.x 和 item.y比较 如果一样就显示对应的内容
          }
        });
        // console.log("经纬度",lat,lng,alt)
        if(!trackTaiFeng) return;
        viewer.camera.lookAt(center, hpr);
      }
    }
  };
  // 飞行跟踪
  viewer.scene.preUpdate.addEventListener(preUpdateHandler);
 
  // 设置插值函数为拉格朗日算法
  typhoonEntity.position.setInterpolationOptions({
    interpolationDegree: 3,
    interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
  });
};
 
// 计算飞行时间和位置
const computeFlight = async (start, positions) => {
  const property = new Cesium.SampledPositionProperty();
  for (let i = 0; i < positions.length; i++) {
    const time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
    const position = Cesium.Cartesian3.fromDegrees(
      parseFloat(positions[i].fLongitude),
      parseFloat(positions[i].fLatitude),
      Cesium.Math.nextRandomNumber() * 500 + 1750,
    );
    property.addSample(time, position);
  }
  return property;
};

// 跟不跟踪台风
export const trackTaiFengState = (v) => {
    trackTaiFeng = v || false
}
// 初始化台风效果
export const initTaiFeng = async (outViewer, track) => {
  viewer = outViewer;
  trackTaiFeng = track || false
  drawLine(jingjiexian24, false, '24小时警示线');
  drawLine(jingjiexian48, true, '48小时警示线');
  addLabelMehods('24小时警示线', [118.859085804271217, 18.184787653347598, 0]);
  addLabelMehods('48小时警示线', [131.945923047920701, 15.047864893994642, 0]);
  // viewer._cesiumWidget._creditContainer.style.display = 'none'; // 去除水印
  // viewer.scene.globe.enableLighting = false; // 关闭日照
  // viewer.scene.globe.depthTestAgainstTerrain = true; // 开启地形探测(地形之下的不可见)
  // viewer.scene.globe.showGroundAtmosphere = false; // 关闭大气层
  // 台风数据
  const data = [...taifengData].reverse();
  const typhoonName = '台风';
  const result = [];
  if (data.length > 0) {
    for (let p = data.length - 1; p >= 0; p--) {
      const d = {
        FID: data[p]['日期'] + ' ' + data[p]['时间'],
        serial: p + 1,
        fLongitude: Number(data[p].y),
        fLatitude: Number(data[p].x),
      };
      result.push(d);
 
      if (p % 10 == 0) {
        selectAll.push(data[p]);
        let color = null;
        const fs = data[p]['风速'].split('m')[0];
        if (fs >= 15 && fs < 20) {
          color = new Cesium.Color(0, 0, 205 / 255);
        } else if (fs >= 20 && fs < 25) {
          color = new Cesium.Color(1, 1, 0);
        } else if (fs >= 25 && fs < 30) {
          color = new Cesium.Color(1, 165 / 255, 0);
        } else if (fs >= 30 && fs < 35) {
          color = new Cesium.Color(1, 140 / 255, 0);
        } else if (fs >= 35) {
          color = new Cesium.Color(1, 0, 0);
        }
        const entity = viewer.entities.add(
          new Cesium.Entity({
            id: data[p]['x'] + '-' + data[p]['y'] + '-' + p,
            point: new Cesium.PointGraphics({
              color: color,
              pixelSize: 20,
              outlineColor: new Cesium.Color(0, 1, 1),
            }),
            label: {
              // text: "风速" + fs + "m/s \n" + data[p]["日期"] + " " + data[p]["时间"].split(":")[0] + "时",
              text: '',
              font: '12px sans-serif',
              pixelOffset: new Cesium.Cartesian2(0, 50),
            },
            position: Cesium.Cartesian3.fromDegrees(Number(data[p].y), Number(data[p].x), 5000),
          }),
        );
        // console.log("entity",entity);
        pointAll.push(entity);
      }
    }
    await typhoonFlytoPath(viewer, result, typhoonName);
  }
  return 1;
};
// 清除台风效果
export const clearTaiFeng = () => {
  if (pineAll.length > 0) {
    pineAll.forEach((item) => {
      viewer.entities.remove(item);
    });
 
  }
  if (pointAll.length > 0) {
    // 取消视角绑定
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    viewer.trackedEntity = undefined;
    pointAll.forEach((item) => {
      viewer.entities.remove(item);
    });
  }
  pineAll.length = 0;
  pointAll.length = 0;
  // 清除警示线
  removeLine();
  //删除label名称
  removeLabelMehods();
  // 清除台风飞行飞行跟踪
  if (preUpdateHandler) {
    viewer.scene.preUpdate.removeEventListener(preUpdateHandler);
  }
};