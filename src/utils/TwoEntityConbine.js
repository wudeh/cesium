// 两点（或两个模型）之间保持连线效果
let entity = viewer.entities.add({
        availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
          start: Cesium.JulianDate.fromDate(new Date("2023-05-21 08:00:00")),
          stop: Cesium.JulianDate.fromDate(new Date("2023-05-21 12:00:00"))
        })]),
        position: property,
        orientation : new Cesium.VelocityOrientationProperty(property),
        model: {
            uri: "/static/Cesium_Air.glb",
            minimumPixelSize: 128,
            maximumScale: 20000,
        },
      })
 let entity1 = viewer.entities.add({
   availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
     start: Cesium.JulianDate.fromDate(new Date("2023-05-21 08:00:00")),
     stop: Cesium.JulianDate.fromDate(new Date("2023-05-21 12:00:00"))
   })]),
   position: property1,
   orientation : new Cesium.VelocityOrientationProperty(property1),
   model: {
       uri: "/static/Cesium_Air.glb",
       color: Cesium.Color.RED,
       minimumPixelSize: 128,
       maximumScale: 20000,
   },
 })
viewer.entities.add({
    polyline: {
        positions: new Cesium.CallbackProperty(function (time, result) {
            var sourpos = entity.position.getValue(time);
            var cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos);
            var lon1 = Cesium.Math.toDegrees(cartographic1.longitude);
            var lat1 = Cesium.Math.toDegrees(cartographic1.latitude);
            var height1 = cartographic1.height;

            var tarpos = entity1.position.getValue(time);
            var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tarpos);
            var lon2 = Cesium.Math.toDegrees(cartographic.longitude);
            var lat2 = Cesium.Math.toDegrees(cartographic.latitude);
            var height2 = cartographic.height;
            return  Cesium.Cartesian3.fromDegreesArrayHeights([lon1,lat1,height1,lon2, lat2, height2])
        }, false),
        width: 5,
        material: Cesium.Color.RED,
    },
    })
