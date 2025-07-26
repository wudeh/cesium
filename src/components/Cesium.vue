<template>
    <div class="cesium" id="cesiumContainer" style="width: 100%;height: 100%;"></div>
</template>
 
<script setup >
    import {onMounted} from "vue";
    import * as Cesium from "cesium";
    import putianJson from '@/assets/json/putian.json';
    import fujianshiJson from '@/assets/json/fujian_shi.json';
    import fujianJson from '@/assets/json/fujian.json';
    import chinaJson from '@/assets/json/china.json';
    import { useRotate, useAddLine, useAddPoint, useAddPolygon } from '@/hooks/useCesium';
    import CircleDiffusion from '@/utils/CircleDiffusion';
    import setBillboard from "@/utils/Billboard";
    import formatClusterPoint from "@/utils/Billboard2";
    import { createTrackModel } from '@/components/TrackModel';
    import { Roaming } from '@/utils/Roaming';
    import setLightArea from '@/utils/LightArea';
    import { RainAll, RainEffect } from '@/utils/Rain';
    import SnowEffect from '@/utils/Snow';
    import { initTaiFeng } from "@/utils/TaiFeng/TaiFeng";
    import { addPoint } from "@/utils/PointSpread"
    import { FlyLine } from "@/utils/FlyLine"
    import analyzingVisibilityFn from "@/utils/AreaAnalyze"
    import { draw } from '@/utils/Draw'
    import Radar from "@/utils/Radar.js";
    import PolylineTrailLinkMaterialProperty from '@/utils/PolylineTrail';
    import addDiv from "@/utils/DivBillboard.js"
    import positionToCood from '@/utils/PositonToCood.js'
    import Top from "@/components/Top.vue"
    let viewer;
 
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1Nzg3MjY4ZC05MzBmLTRjY2QtOTAwYy0zZDUxMzUxY2MwOTUiLCJpZCI6MzE0MDE4LCJpYXQiOjE3NTA0MDgwMDF9.Lob16HZhNHzDGntvVfOzqeDL_WH7Nf4aNd1S0tNMBIA';
    // 设置 cesium 默认停留位置为中国
    // Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(73.66, 3.86, 135.05, 53.55);
    // 设置 cesium
    const cesiumConfig = {
        // 主页按钮
        homeButton: false,
        // 场景模式选择器
        sceneModePicker: false,
        // 全屏按钮
        fullscreenButton: false,
        // 是否显示点击要素之后显示的信息
        infoBox: false,
        // 要素选中框
        selectionIndicator: false,
        // 影像切换
        baseLayerPicker: false,
        // 启用了阴影效果
        shadows: true,
        // 启用动画
        shouldAnimate: true,
        // 是否显示动画控件
        animation: false,
        // 是否显示时间线控件
        timeline: false,
        // 是否显示地名查找控件
        geocoder: false,
        // 是否显示帮助信息控件
        navigationHelpButton: false,
        // contextOptions removed or properly defined if needed
        // 版权信息
        creditContainer: document.createElement('div')
    }
      
    const initMap = async () => {
        viewer = new Cesium.Viewer('cesiumContainer', cesiumConfig)
        window.viewer = viewer;
        // console.log(Cesium.Scene)

        const gaodeImageryProvider = new Cesium.UrlTemplateImageryProvider({
            // url: "https://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=8&ltype=4",
            // url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
            url: "http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8",
            // url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
            minimumLevel: 1,
            maximumLevel: 18,
          });


        viewer.imageryLayers.addImageryProvider(gaodeImageryProvider); 

        // 加载卫星轨道数据
        let czmldata = new Cesium.CzmlDataSource.load('./wx.czml');
        viewer.dataSources.add(czmldata)
        // 设置当前时间为卫星时间，不然没有卫星动画
        viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date('2023-05-10T06:39:23.797780+00:00'));
        // 把cesium的动画开关打开
        viewer.clock.shouldAnimate = true;


        viewer.terrainProvider = await Cesium.createWorldTerrainAsync({
          requestVertexNormals: true, // 请求法线加载地形数据，用于地形光照
          requestWaterMask: true, // 动态海洋水效果
        });


        // 添加每个市的线
        (fujianshiJson).features.forEach(item => {
            useAddLine(viewer, item.geometry.coordinates[0].flat(Infinity), item.properties.name)
        })
        var Line = useAddLine(viewer, (fujianshiJson).features[0].geometry.coordinates[0].flat(Infinity))

        let arr = (fujianshiJson).features.map(item => {
            return item.geometry.coordinates[0].flat(Infinity)
        })
        let ids = (fujianshiJson).features.map(item => {
            return item.properties.name
        })
        // 绘制每个市的面
        var primitive = useAddPolygon(viewer, arr, ids, Cesium.Color.fromCssColorString('#6fe5ec').withAlpha(0.01))
        // let point = useAddPoint(viewer, (fujianshiJson).features[0].properties.center)
      
        


        // 福建省每个市中心的广告牌
        let billArr = (fujianshiJson).features.map(item => {
            return {
              coordinates: item.properties.center,
              name: item.properties.name,
            }
        })

        const billboardsCollection = setBillboard(viewer, billArr);


        

        
        // 3 秒后飞到福州
        setTimeout(() => {
          // 设置相机飞到哪个经纬度
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees((fujianshiJson).features[0].properties.center[0], (fujianshiJson).features[0].properties.center[1], 2000000), // 设置位置
            orientation: {
              heading: Cesium.Math.toRadians(0), // 方向
              pitch: Cesium.Math.toRadians(-90),// 倾斜角度
              roll: 0
            },
            duration: 5, // 设置飞行持续时间，默认会根据距离来计算
            complete: async () => {
              // 到达位置后执行的回调函数
              // 添加 cesium 的自带建筑物模型
              // 这里使用了 OSM 的建筑物模型
              // const tileset = await Cesium.createOsmBuildingsAsync();
              // viewer.scene.primitives.add(tileset)

              // 添加福建省以外的暗面
              const lightArea = setLightArea(viewer, fujianJson.features[0].geometry.coordinates[0].flat(Infinity));
              window.lightArea = lightArea
            },
            cancle: function () {
              // 如果取消飞行则会调用此函数
            },
            pitchAdjustHeight: -90, // 如果摄像机飞越高于该值，则调整俯仰俯仰的俯仰角度，并将地球保持在视口中。
            maximumHeight: 5000, // 相机最大飞行高度
            flyOverLongitude: 100, // 如果到达目的地有2种方式，设置具体值后会强制选择方向飞过这个经度(这个，很好用)
          });
        }, 3000);
        
        

        

        let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);//处理用户输入事件
        handler.setInputAction(function (event) {       // 设置左键点击事件
          let pick = viewer.scene.pick(event.position); // 获取 pick 拾取对象
          console.log(pick)
          if (Cesium.defined(pick) && typeof pick.id === 'string' && pick.id.indexOf("mark") > -1) {                   // 判断是否获取到了 pick 
            console.log(pick);
            // 点击每个市中心，弹一个框
            createTrackModel(
            { 
              name: 'RailwayStation',
              props: {
                name: pick.id.split('_')[1],
              },
            },
            {
              viewer: viewer,
              coordinate: event.position,
              autoScale: true,
              // 距离地面多高显示弹窗
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2100000),
              // 距离多高缩放弹窗
              scaleByDistance: new Cesium.NearFarScalar(0, 1.3, 6000, 0.8),
              offset: {
                y: -30,
              },
              fly: false,
              show: 'afterFly',
              flyOffset: {
                longitude: -0.011696,
                latitude: -0.097186,
                height: 500000,
              },
              duration: 0,
            },
            {
              title: '城市',
            },
          );
          }
          // console.log('鼠标点击事件：', event.position); // 输出鼠标点击
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        handler.setInputAction(function(movement){
          // console.log('移动事件：',movement.endPosition); 
          let pick = viewer.scene.pick(movement.endPosition); // 获取 pick 拾取对象
          if (Cesium.defined(pick) && typeof pick.id == 'string' && !pick.id.includes('_')) {                   // 判断是否获取到了 pick 
            primitive.forEach(item => {
              item.appearance.material.uniforms.color = Cesium.Color.fromCssColorString('#6fe5ec').withAlpha(0.01);
            })
            pick.primitive.appearance.material.uniforms.color = Cesium.Color.fromCssColorString('#6fe5ec').withAlpha(0.5);
            
          }else{
            // console.log('鼠标移动到多边形外',primitive);
            // 如果鼠标移动到多边形外，则恢复多边形颜色
            primitive.forEach(item => {
              item.appearance.material.uniforms.color = Cesium.Color.fromCssColorString('#6fe5ec').withAlpha(0.01);
            })
          }  
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // 移除鼠标事件
        // handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);



        

        // 添加雨天效果
        //  const rain = new RainEffect(viewer);
        // 下雪效果
        // const snow = new SnowEffect(viewer);


        
        // 添加一个模型
        // const shanghaiEntity = viewer.entities.add({
        //   id: 'shanghaiCity',
        //   type: "gltf_model",
        //   position: Cesium.Cartesian3.fromDegrees((fujianshiJson).features[0].properties.center[0], (fujianshiJson).features[0].properties.center[1], 0),
        //   // props: this.props,
        //   // orientation: this.calculateOrientation(),
        //   model: {
        //     uri: './shanghaiCity/scene.gltf',
        //     // minimumPixelSize: 500,
        //     // maximumScale: 1,
        //     scale: 100,
        //     show: true
        //   }
        // })
        // viewer.flyTo(shanghaiEntity)

        // 添加台风效果
        // initTaiFeng(viewer)

        // 添加点扩散效果（台北市）
        addPoint(viewer, 'point_spread_danger', [121.50,25.03], 25000, 25000)
        // 绘制雷达效果
        const radar1 = new Radar(viewer, {
            longitude: 121.50,//经度
            latitude: 24.03,//纬度
            radius: 50000, // 雷达半径 单位米
            rotationSpeed: 10//速度
        })

        // 飞线效果，从福州飞往其他福建市区
        FlyLine(viewer, [(fujianshiJson).features[0].properties.center,(fujianshiJson).features[1].properties.center],100000)
        FlyLine(viewer, [(fujianshiJson).features[0].properties.center,(fujianshiJson).features[2].properties.center],100000)
        FlyLine(viewer, [(fujianshiJson).features[0].properties.center,(fujianshiJson).features[3].properties.center],100000)
        FlyLine(viewer, [(fujianshiJson).features[0].properties.center,(fujianshiJson).features[4].properties.center],100000)
        FlyLine(viewer, [(fujianshiJson).features[0].properties.center,(fujianshiJson).features[5].properties.center],100000)
        FlyLine(viewer, [(fujianshiJson).features[0].properties.center,(fujianshiJson).features[6].properties.center],100000)
        FlyLine(viewer, [(fujianshiJson).features[0].properties.center,(fujianshiJson).features[7].properties.center],100000)
        FlyLine(viewer, [(fujianshiJson).features[0].properties.center,(fujianshiJson).features[8].properties.center],100000)

        // 绘制面
        // draw(viewer, 'Polygon')

        // 绘制流动的线，线经纬度是福建省边界
        // 福建省边界，因为有些经纬度数据不正确，所以只截取了前面 1720 个经纬度
        const positions = (fujianJson).features[0].geometry.coordinates.flat(2).map((i,index) => {
          return [i[0], i[1], 80000];// 经纬度，高度
        }).slice(0,1720);
        const positions2 = positions.map((i,index) => {
          return [i[0], i[1], 0];// 经纬度，高度
        })
        const polyline = viewer.entities.add({
            polyline: {
              // fromDegreesArrayHeights 需要传的数组格式是[经度, 纬度, 高度, 经度, 纬度, 高度]
              positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions2.flat(Infinity)),
              width: 5,
              // 需要传流动的线图片
              material: new PolylineTrailLinkMaterialProperty('./flowLine.png', Cesium.Color.RED, 1000),
            },
        });   
    }
    onMounted(() => {
        initMap();
    })
</script>
 
<style scoped>
  .cesium {
    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
  }
</style>