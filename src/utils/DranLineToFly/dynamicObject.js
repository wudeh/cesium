import core from "./Core.js";
import getPosition from "./getPosition.js";

/**
 * 创建浏览对象。
 * @constructor xp
 * @time 2022-12-25
 * @param {*} viewer
 * @param {*} cesium
 */
function dynamicObject(viewer, cesium) {
  this._viewer = viewer;
  this._cesium = cesium;
  this._core = new core();
  this._getPosition = new getPosition(this._viewer, this._cesium);
  this._entityFly = null;
}

/**
 * 这个方法用于创建浏览对象
 * @returns {Promise.<Object>} 返回一个Cesium的对象。
 *
 */
// var ploylinejl = {
//   polyline: {},
//   cameraRoll: null,
//   cameraPitch: null,
//   cameraPosition: null,
//   cameraHeading: null,
//   positions: [],
//   distance: [],
//   Totaltime: "",
//   dsq: null
// };
dynamicObject.prototype.executeFlycesium = function (method) {
  //设置浏览路径
  // var polylines = {};
  var _this = this;
  var PolyLinePrimitive = (function () {
    function execute(positions) {
      this.options = {
        polyline: {
          show: true,
          positions: [],
          material: new _this._cesium.PolylineGlowMaterialProperty({
            glowPower: 0.1,
            color: _this._cesium.Color.YELLOW
          }),
          width: 10,
          clampToGround: true
        }
      };
      this.positions = positions;
      this._init();
    }

    execute.prototype._init = function () {
      var _self = this;
      var _update = function () {
        return _self.positions;
      };
      //实时更新polyline.positions
      this.options.polyline.positions = new _this._cesium.CallbackProperty(
        _update,
        false
      );
      this.flycesium = _this._viewer.entities.add(this.options);
      _this.item = this.flycesium;
    };
    return execute;
  })();
  var handler = (this.handler = new _this._cesium.ScreenSpaceEventHandler(
    _this._viewer.scene.canvas
  ));
  var positions = [];
  // var flyceium = null;
  var distance = 0;
  var poly = undefined;
  var ploylinejl = {
    polyline: {},
    cameraRoll: null,
    cameraPitch: null,
    cameraPosition: null,
    cameraHeading: null,
    positions: [],
    distance: [],
    Totaltime: ""
  };
  //导入tool提示框
  var tooltip = this._core.CreateTooltip();
  //设置鼠标样式
  this._core.mouse(this._viewer.container, 1, window.SmartEarthRootUrl);
  handler.setInputAction(function (movement) {
    var cartesian = _this._getPosition.getMousePosition(movement);
    if (_this._core.getBrowser().pc === "pc" && positions.length == 0) {
      positions.push(cartesian.clone());
    }
    positions.push(cartesian);
    if (positions.length >= 2) {
      if (!_this._cesium.defined(poly)) {
        poly = new PolyLinePrimitive(positions);
      }
      distance = _this._core.getSpaceDistancem(positions, _this._cesium);
    }
  }, this._cesium.ScreenSpaceEventType.LEFT_CLICK);
  //鼠标移动
  handler.setInputAction(function (movement) {
    tooltip.showAt(movement.endPosition, "左键开始,右键结束！");
    var cartesian = _this._getPosition.getMousePosition(movement);
    if (positions.length >= 2) {
      if (!_this._cesium.defined(poly)) {
        poly = new PolyLinePrimitive(positions);
      } else {
        if (cartesian) {
          positions.pop();
          //cartesian.y += (1 + Math.random());
          positions.push(cartesian);
        }
      }
      distance = _this._core.getSpaceDistancem(positions, _this._cesium);
    }
  }, this._cesium.ScreenSpaceEventType.MOUSE_MOVE);
  //单击鼠标右键结束画线
  handler.setInputAction(function () {
    _this.end();
  }, this._cesium.ScreenSpaceEventType.RIGHT_CLICK);

  this.end = function (type) {
    handler.destroy();
    tooltip.show(false);
    //设置鼠标样式
    _this._core.mouse(_this._viewer.container, 0);

    _this.end = undefined;
    _this._viewer.entities.remove(_this.item);

    if (type === "cancel" || positions.length < 2) {
      return;
    }
    distance = _this._core.getSpaceDistancem(positions, _this._cesium);

    ploylinejl.polyline = poly;
    ploylinejl.positions = positions;
    ploylinejl.distance = parseFloat(distance);
    //转化成浏览对象
    _this.setFlycesium(ploylinejl, function (flyceium) {
      _this.flyceium = flyceium;
      _this.ploylinejl = ploylinejl;
      if (typeof method == "function") {
        method(flyceium);
      }
    });
  };
  return this;
};
/**
 * 设置获取浏览对象
 */
dynamicObject.prototype.setFlycesium = function (drawHelper, callback) {
  var _this = this;
  var coordinates = [];
  // var position = null;
  // var heading = null;
  // var pitch = null;
  // var roll = null;
  var maxHeight = 0;
  for (var i = 0; i < drawHelper.positions.length; i++) {
    var cartographic = _this._cesium.Cartographic.fromCartesian(
      drawHelper.positions[i]
    ); //世界坐标转地理坐标（弧度）
    var point = [
      (cartographic.longitude / Math.PI) * 180,
      (cartographic.latitude / Math.PI) * 180,
      cartographic.height
    ]; //地理坐标（弧度）转经纬度坐标
    //console.log(point);
    coordinates.push(point);
  }
  this._core.getPmfxPro(
    drawHelper.positions,
    25,
    0,
    _this._cesium,
    _this._viewer,
    data => {
      maxHeight = data.max;
      var time;
      time = (drawHelper.distance / 50).toFixed(1);
      var pathsData = {
        id: _this._core.getuid(),
        name: "新建路线",
        distance: drawHelper.distance,
        showPoint: false,
        showLine: true,
        showModel: true,
        isLoop: false,
        Totaltime: Math.round(time),
        speed: 50,
        height: (maxHeight + 200).toFixed(2),
        pitch: -20,
        range: 100,
        mode: 0,
        url: "/GroundVehicle.glb",
        geojson: {
          // orientation: {heading: heading, pitch: pitch, roll: roll},
          // position: position,
          geometry: { type: "LineString", coordinates: coordinates }
        }
      };
      callback && callback(pathsData);
    }
  );
};
/**
 * 开始浏览
 */
dynamicObject.prototype.Start = function (data, url, funs) {
  var _this = this;
  // var pathsData = data.geojson;
  if (!data.Totaltime) {
    data.Totaltime = 3000;
  }
  if (_this._entityFly) {
    _this.exit();
  }
  // _this._viewer.camera.setView({
  //     destination: pathsData.position,
  //     orientation: pathsData.orientation,
  // });
  fun = funs;
  setTimeout(function () {
    _this.executeFly3D(data, url);
  }, 200);
  return this;
};
var entityFly = null;
var entityModel = null;
//var start;
var fun = null;
var entityhd = {
  start: null,
  time: null,
  longitude: 0,
  latitude: 0,
  cameraHeight: 100,
  //timedifference: null,
  speed: 50,
  multiplier: 1,

  position: 0
};
// var stop;
var velocityVector, velocityVectorProperty, velocityOrientationProperty;
var AngleProperty, property;
var wheelAngle = 0;

/**
 * 播放路径动画
 * @param {Object} data 数据
 * @param {Object} data.geojson 路线数据
 * @param {Number} [data.lineHeight] 路线高度，默认贴地
 * @param {Boolean} [data.isLoop=false] 是否循环播放
 * @param {String} [url] 模型路径
 */
dynamicObject.prototype.executeFly3D = function (data, url) {
  var _this = this;
  var pathsData = data.geojson;
  velocityVector = new _this._cesium.Cartesian3();
  AngleProperty = new _this._cesium.SampledProperty(Number);
  property = new _this._cesium.SampledPositionProperty();

  if (pathsData && pathsData.geometry) {
    var positionA = pathsData.geometry.coordinates;
    var position = [];
    var position1 = [];
    if (positionA.length > 0) {
      for (var i = 0; i < positionA.length; i++) {
        var x = positionA[i][0];
        var y = positionA[i][1];
        var z = positionA[i][2];
        data.lineHeight !== void 0 && (z = data.lineHeight);
        position1.push(x, y, z);
        position.push({ x: x, y: y, z: z });
      }
    } else {
      return;
    }

    _this._viewer.clock.clockRange = data.isLoop
      ? _this._cesium.ClockRange.LOOP_STOP
      : _this._cesium.ClockRange.CLAMPED; //Loop at the end
    _this._viewer.clock.multiplier = data.multiplier || 1;
    _this._viewer.clock.canAnimate = false;
    _this._viewer.clock.shouldAnimate = true; //设置时间轴动态效果
    entityhd.distance = data.distance;
    entityhd.cameraHeight = data.height;
    entityhd.lineHeight = data.lineHeight;
    entityhd.pitch = data.pitch;
    entityhd.range = data.range;
    entityhd.speed = data.speed || 50;
    entityhd.Totaltime = data.distance / entityhd.speed;

    entityhd.start = _this._cesium.JulianDate.fromDate(new Date());
    entityhd.stop = _this._cesium.JulianDate.addSeconds(
      entityhd.start,
      entityhd.Totaltime,
      new _this._cesium.JulianDate()
    );
    //Make sure viewer is at the desired time.
    _this._viewer.clock.startTime = entityhd.start.clone();
    _this._viewer.clock.stopTime = entityhd.stop.clone();
    _this._viewer.clock.currentTime = entityhd.start.clone();

    var _position = _this.computeCirclularFlight(position);
    entityhd.position = _position;
    entityhd.degrees = position;
    velocityOrientationProperty = new _this._cesium.VelocityOrientationProperty(
      _position
    );

    var mode = {};
    if (url !== "") {
      mode = {
        show: _this._cesium.defaultValue(data.showModel, true),
        scale: _this._cesium.defaultValue(data.modelScale, 1),
        uri: url
      };
    } else {
      // const modelUrl = Cesium.buildModuleUrl(
      //   "Assets/GltfModels/CesiumAir/Cesium_Air.glb"
      // );
      mode = {
        show: _this._cesium.defaultValue(data.showModel, true),
        scale: _this._cesium.defaultValue(data.modelScale, 1)
        // uri: modelUrl
      };
    }
    if (data.modelData) {
      mode = _this._core.extend(mode, data.modelData);
    }
    changeFlyView = function () {};
    entityFly = _this._viewer.entities.add({
      //Set the entity availability to the same interval as the simulation time.
      availability: new _this._cesium.TimeIntervalCollection([
        new _this._cesium.TimeInterval({
          start: entityhd.start,
          stop: entityhd.stop
        })
      ]),
      position: _position,
      //Show the path as a pink line sampled in 1 second increments.
      polyline: {
        clampToGround: entityhd.lineHeight === void 0,
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(position1),
        show: _this._cesium.defaultValue(data.showLine, true),
        material: new _this._cesium.PolylineGlowMaterialProperty({
          glowPower: 0.1,
          color: _this._cesium.Color.YELLOW
        }),
        width: 10
      },
      label: {
        text: new _this._cesium.CallbackProperty(updateSpeedLabel, false),
        font: "20px sans-serif",
        showBackground: false,
        distanceDisplayCondition: new _this._cesium.DistanceDisplayCondition(
          0.0,
          100.0
        ),
        eyeOffset: new _this._cesium.Cartesian3(0, 3.5, 0)
      }
    });
    // console.log(_position);

    entityModel = _this._viewer.entities.add({
      availability: new _this._cesium.TimeIntervalCollection([
        new _this._cesium.TimeInterval({
          start: entityhd.start,
          stop: entityhd.stop
        })
      ]),
      position: _position,
      orientation: velocityOrientationProperty,
      point: {
        show: _this._cesium.defaultValue(data.showPoint, false),
        color: _this._cesium.Color.RED,
        outlineColor: _this._cesium.Color.WHITE,
        outlineWidth: 2,
        pixelSize: 10
      },
      model: mode,
      billboard: data.image,
      viewFrom:
        data.viewFrom || new _this._cesium.Cartesian3(500.0, 500.0, 500.0)
    });
    entitymodels = entityFly;
    _this._viewer.trackedEntity = entityModel;
    _this._entityFly = entityFly;

    data.mode && _this.changeFlyMode(data.mode);

    // setTimeout(function () {
    //     // _this._viewer.camera.zoomOut(500.0);//缩小地图，避免底图没有数据
    //     _this._viewer.camera.zoomOut(300.0);//缩小地图，避免底图没有数据
    // }, 100);
  } else {
    return;
  }

  function updateSpeedLabel(time) {
    //alert(time);
    //entityhd.time = time;
    // var de = entitymodels;
    // var camera = _this._viewer.camera;
    if (
      _this._viewer.clock.clockRange !== 2 &&
      Cesium.JulianDate.equals(
        _this._viewer.clock.currentTime,
        _this._viewer.clock.stopTime
      )
    ) {
      entityFly.label.text = "";
      _this.exit();
      if (fun != null && typeof fun === "function") {
        fun("end");
      }
      changeFlyView = function () {};
      return;
    }
    try {
      var position = entitymodels.position.getValue(
        _this._viewer.clock.currentTime
      );
      var cartographic = _this._cesium.Cartographic.fromCartesian(position);
      //经度
      entityhd.longitude = _this._cesium.Math.toDegrees(cartographic.longitude);
      //纬度
      entityhd.latitude = _this._cesium.Math.toDegrees(cartographic.latitude);
      if (entityhd.lineHeight === void 0) {
        let height1 = _this._viewer.scene.sampleHeight(cartographic, [
          entityModel,
          entitymodels
        ]);
        let height2 = _this._viewer.scene.globe.getHeight(cartographic);
        entityModel.position = _this._cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          height2 > height1 ? height2 : height1
        );
      }
    } catch (er) {
      console.log(er);
    }
    try {
      velocityVectorProperty.getValue(time, velocityVector);
      changeFlyView(time);
      var metersPerSecond = _this._cesium.Cartesian3.magnitude(velocityVector);
      var kmPerHour = Math.round(metersPerSecond * 3.6);
      kmPerHour += " km/h";
      //已漫游时间
      entityhd.time = _this._cesium.JulianDate.secondsDifference(
        time,
        entityhd.start
      );
      //已漫游比例
      entityhd.ratio = entityhd.time / entityhd.Totaltime;
      //已漫游距离
      entityhd.distanceTraveled = entityhd.ratio * entityhd.distance;
      //运行速度
      entityhd.speed = kmPerHour;
      //漫游高程
      entityhd.height = cartographic.height;
      //地面高程
      entityhd.globeHeight = _this._viewer.scene.globe.getHeight(cartographic);

      if (fun != null && typeof fun === "function") {
        fun(entityhd);
      }
    } catch (er) {
      console.log(er);
    }
    return "";
  }
};

// var hpr = new Cesium.HeadingPitchRoll();
var flyPosition;
// var Quaternion = new Cesium.Quaternion();
// var _heading = 0;
var entitymodels = null;

//改变视角
var changeFlyView;

function getHeading(time) {
  wheelAngle = AngleProperty.getValue(time);
  entityhd.heading = wheelAngle;
}

function getFlyPosition(position) {
  var cartographic = Cesium.Cartographic.fromCartesian(position);
  var lon = Cesium.Math.toDegrees(cartographic.longitude);
  var lat = Cesium.Math.toDegrees(cartographic.latitude);
  return Cesium.Cartesian3.fromDegrees(lon, lat, entityhd.cameraHeight || 100);
}

/**
 * 显示点
 */
dynamicObject.prototype.showPoint = function (isShow) {
  entityModel && entityModel.point && (entityModel.point.show = isShow);
};

/**
 * 显示线
 */
dynamicObject.prototype.showLine = function (isShow) {
  entityFly && entityFly.polyline && (entityFly.polyline.show = isShow);
};

/**
 * 显示模型
 */
dynamicObject.prototype.showModel = function (isShow) {
  entityModel && entityModel.model && (entityModel.model.show = isShow);
};

//飞行高度
dynamicObject.prototype.setFlyHeight = function (height) {
  entityhd.cameraHeight = height;
};

//飞行距离
dynamicObject.prototype.setFlyDistance = function (distance) {
  entityhd.range = distance;
};

//飞行俯仰角
dynamicObject.prototype.setFlyPitch = function (pitch) {
  entityhd.pitch = pitch;
};

//飞行模式
dynamicObject.prototype.changeFlyMode = function (index) {
  var _this = this;
  switch (index) {
    case 0:
      changeFlyView = function () {};
      _this.BindingModel(true);
      break;
    case 1:
      this.BindingModel(false);
      changeFlyView = function (time) {
        getHeading(time);
        _this.exeuteVisualAngle(
          _this._cesium.Math.toRadians(entityhd.heading),
          _this._cesium.Math.toRadians(entityhd.pitch),
          entityhd.range
        );
      };
      break;
    case 2:
      this.BindingModel(false);
      changeFlyView = function (time) {
        getHeading(time);
        flyPosition = _this._entityFly.position.getValue(
          _this._viewer.clock.currentTime
        );
        if (!flyPosition) return;
        flyPosition = getFlyPosition(flyPosition);
        _this._viewer.camera.setView({
          destination: flyPosition,
          orientation: {
            heading: _this._cesium.Math.toRadians(entityhd.heading),
            pitch: _this._cesium.Math.toRadians(-90),
            roll: 0.0
          }
        });
      };
      break;
  }
};

/**
 * 加速
 */
dynamicObject.prototype.faster = function () {
  this._viewer.animation.viewModel.faster();
};

/**
 * 减速
 */
dynamicObject.prototype.slower = function () {
  // 倍率减
  this._viewer.animation.viewModel.slower();
};

/**
 * 设置倍数
 */
dynamicObject.prototype.setMultiplier = function (multiplier) {
  this._viewer.clock.multiplier = parseFloat(multiplier);
};

/**
 * 是否暂停
 */
dynamicObject.prototype.isPause = function (isPause) {
  var clockViewModel = this._viewer.clockViewModel;
  clockViewModel.shouldAnimate = !isPause;
};

/**
 * 结束飞行
 */
dynamicObject.prototype.exit = function () {
  this.isPause(true);
  this._viewer.clock.multiplier = 1;
  this.executeSignout();
  this.BindingModel(false);
  this._viewer.entities.remove(entityFly);
  this._viewer.entities.remove(entityModel);
  entityFly = null;
  entityModel = null;
  this._entityFly = null;
};

//lable回调函数
dynamicObject.prototype.updateSpeedLabel = function () {
  //if (fun && typeof fun === 'function') {
  //    fun(_this._entityFly);
  //}
  //this.entityhd = {
  //    start: null,
  //    time: null
  //};
  //this.entityhd.time = time;
  //if (this.fun != null && typeof fun === 'function') {
  //    fun(_this._entityFly);
  //}
  //return "";
};

//添加时间位置样本
dynamicObject.prototype.computeCirclularFlight = function (position) {
  var _this = this;
  velocityVectorProperty = new _this._cesium.VelocityVectorProperty(
    property,
    false
  );
  var _time, time, _position, _position1;
  for (var i = 0; i < position.length; i++) {
    if (i === 0) {
      //起点
      time = _this._cesium.JulianDate.addSeconds(
        entityhd.start,
        0,
        new _this._cesium.JulianDate()
      );
      _position = _this._cesium.Cartesian3.fromDegrees(
        position[0].x,
        position[0].y,
        entityhd.lineHeight
      );

      property.addSample(time, _position);
      //计算两点方位角
      wheelAngle = _this._core.TwoPointAzimuth(
        position[0].x,
        position[0].y,
        position[1].x,
        position[1].y
      );
      AngleProperty.addSample(time, wheelAngle);
    }
    try {
      if (i > 0 && i != position.length - 1) {
        _position = new _this._cesium.Cartesian3(
          property._property._values[i * 3 - 3],
          property._property._values[i * 3 - 2],
          property._property._values[i * 3 - 1]
        );
        _position1 = _this._cesium.Cartesian3.fromDegrees(
          position[i].x,
          position[i].y,
          _this._cesium.defaultValue(entityhd.lineHeight, position[i].z)
        );

        var positions = [
          _this._cesium.Cartographic.fromCartesian(_position),
          _this._cesium.Cartographic.fromCartesian(_position1)
        ];
        var a = new _this._cesium.EllipsoidGeodesic(positions[0], positions[1]);
        var long = a.surfaceDistance;
        time = _this._cesium.JulianDate.addSeconds(
          property._property._times[i - 1],
          0.5,
          new _this._cesium.JulianDate()
        );
        _time = _this._cesium.JulianDate.addSeconds(
          property._property._times[i - 1],
          long / entityhd.speed,
          new _this._cesium.JulianDate()
        );

        property.addSample(_time, _position1);
        //计算两点方位角
        wheelAngle = _this._core.TwoPointAzimuth(
          position[i - 1].x,
          position[i - 1].y,
          position[i].x,
          position[i].y
        );
        AngleProperty.addSample(time, wheelAngle);
        AngleProperty.addSample(_time, wheelAngle);
      }
    } catch (e) {
      console.log(e);
    }
  }
  return property;
};
/**
 * 暂停浏览
 */
dynamicObject.prototype.executePauseFly3DPaths = function () {
  var clockViewModel = this._viewer.clockViewModel;
  if (clockViewModel.shouldAnimate) {
    clockViewModel.shouldAnimate = false;
  } else if (this._viewer.clockViewModel.canAnimate) {
    clockViewModel.shouldAnimate = true;
  }
};

/**
 * 添加对象
 */
dynamicObject.prototype.changeModel = function (url) {
  entityModel.model.uri = url;
};
//浏览方式飞向视点
/**
 * 获取视野点
 */
dynamicObject.prototype.PointView = function () {
  var originalCameraLocation = {
    position: Viewer.camera.position.clone(),
    orientation: {
      heading: Viewer.camera.heading,
      pitch: Viewer.camera.pitch,
      roll: Viewer.camera.roll
    }
  };
  return originalCameraLocation;
};
/**
 * 开始浏览。
 * @param {Paths}
 * @returns {Object} 返回一个json对象。
 */
dynamicObject.prototype.PlayPaths = function () {
  var that = this;
  setInterval(function () {
    viewer.camera.setView({
      // Cesium的坐标是以地心为原点，一向指向南美洲，一向指向亚洲，一向指向北极州
      // fromDegrees()方法，将经纬度和高程转换为世界坐标
      destination: that._cesium.Cartesian3.fromDegrees(117.48, 30.67, 15000.0),
      orientation: {
        // 指向
        heading: that._cesium.Math.toRadians(90, 0),
        // 视角
        pitch: that._cesium.Math.toRadians(-90),
        roll: 0.0
      }
    });
  }, 2000);
};
/**
 * 绑定模型
 * @param {binding} 是否绑定。
 */
dynamicObject.prototype.BindingModel = function (binding) {
  if (binding) {
    this._viewer.trackedEntity = entityModel;
  } else {
    this._viewer.trackedEntity = undefined;
    this._viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
  }
};
/**
 * 改变视角
 * @returns {Object} 返回一个json对象。
 */
dynamicObject.prototype.exeuteVisualAngle = function (
  viewHeading,
  viewPitch,
  viewRange
) {
  var hpRange = { heading: null, pitch: null, range: null };
  hpRange.heading = viewHeading || this._cesium.Math.toRadians(90);
  hpRange.pitch = viewPitch || this._cesium.Math.toRadians(0);
  hpRange.range = viewRange || 1000;
  var center = this._entityFly.position.getValue(
    this._viewer.clock.currentTime
  );
  if (!center) return;
  center = getFlyPosition(center);
  var hpRanges = new this._cesium.HeadingPitchRange(
    hpRange.heading,
    hpRange.pitch,
    hpRange.range
  );
  //if (center) this._viewer.camera.lookAt(center, hpRange);
  this._viewer.camera.lookAt(center, hpRanges);
};
/**
 * 是否显示路线
 * @returns {Object} 返回一个json对象。
 */
dynamicObject.prototype.Pathshow = function (route) {
  this._entityFly.polyline.show = route;
};
/**
 * 是否显示点
 * @returns {Object} 返回一个json对象。
 */
dynamicObject.prototype.Pointshow = function (route) {
  entityModel._point.show = route;
};
/**
 * 是否显示模型
 * @returns {Object} 返回一个json对象。
 */
dynamicObject.prototype.Modelshow = function (route) {
  entityModel._model.show = route;
};
/**
 * 向前飞行漫游路径
 * @returns {Object} 返回一个json对象。
 */
dynamicObject.prototype.executePlayForwardFly3DPaths = function () {
  var clockViewModel = this._viewer.clockViewModel;
  var multiplier = clockViewModel.multiplier;
  if (multiplier < 0) {
    clockViewModel.multiplier = -multiplier;
  }
  clockViewModel.shouldAnimate = true;
};
/**
 * 向后飞行漫游路径
 */
dynamicObject.prototype.executePlayReverseFly3DPaths = function () {
  var clockViewModel = this._viewer.clockViewModel;
  var multiplier = clockViewModel.multiplier;
  if (multiplier > 0) {
    clockViewModel.multiplier = -multiplier;
  }
  clockViewModel.shouldAnimate = true;
};
/**
 * 退出飞行漫游路径
 */
dynamicObject.prototype.executeSignout = function () {
  var start = this._cesium.JulianDate.fromDate(new Date());
  this._viewer.clock.startTime = start.clone();
  var stop = this._cesium.JulianDate.addSeconds(
    start,
    86400,
    new this._cesium.JulianDate()
  );
  this._viewer.clock.stopTime = stop.clone();
  //this.cesiumViewer.entities.remove(this.entityFly);
};

/**
 * 结束当前操作
 */
dynamicObject.prototype.forceEndHanlder = function () {
  if (this.handler) {
    this.handler.destroy();
    this.handler = undefined;
  }
};
export default dynamicObject;

