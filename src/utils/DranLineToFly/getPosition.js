/**
 *
 * 获取位置。
 * xp
 * @alias getPosition
 * @constructor
 *
 */

function getPosition (viewer, cesium) {
  this._viewer = viewer;
  this._cesium = cesium;
}

getPosition.prototype.getPosition = function () {
  return this._viewer.camera.position;
};

getPosition.prototype.getDegrees = function () {
  var cartographic = this._viewer.camera.positionCartographic;
  var Degrees = {
    lon: this._cesium.Math.toDegrees(cartographic.longitude),
    lat: this._cesium.Math.toDegrees(cartographic.latitude),
    height: cartographic.height
  };

  return Degrees;
};
/**
 * 获取鼠标当前世界坐标
 * @param {object} [movement] 鼠标屏幕位置
 * @param {Array/Object} [objectsToExclude] 排除的实体对象
 * @param {number} [type] 类型（0为模型优先，1为地形优先）,默认模型优先
 * @param {boolean} [isAdsorption] true|false 是否吸附，默认否
 * @param {number} [distance] 吸附半径，默认30
 **/
getPosition.prototype.getMousePosition = function (
  movement,
  objectsToExclude,
  type,
  isAdsorption,
  distance
) {
  var mousePosition = movement.endPosition || movement.position || movement;
  type === undefined && (type = 0);
  isAdsorption = this._cesium.defaultValue(isAdsorption, false);
  this.defaultDepthTest === undefined &&
    (this.defaultDepthTest =
      !!this._viewer.scene.globe.depthTestAgainstTerrain);

  var ray, cartesian, _cartesian, feature;
  //this.isObjectsToExcludeShow(objectsToExclude, false);
  var width = isAdsorption ? (distance ? distance : 30) : 1;
  if (type !== 0) {
    //地形优先
    //开启深度检测
    this._viewer.scene.globe.depthTestAgainstTerrain = true;
    ray = this._viewer.camera.getPickRay(mousePosition);
    ray && (cartesian = this._viewer.scene.globe.pick(ray, this._viewer.scene));
    //isAdsorption && (mousePosition = this.getAdsorptionPosition(mousePosition, objectsToExclude));

    if (!objectsToExclude || objectsToExclude.length === 0) {
      feature = this._viewer.scene.pick(mousePosition);
      if (feature && feature.id && !this.id3DGraphic(feature.id)) {
        feature = undefined;
      }
    } else {
      feature = this._viewer.scene.drillPick(
        mousePosition,
        objectsToExclude.length,
        width,
        width
      );
      feature = this.getNotExcludedObj(feature, objectsToExclude);
    }

    if (feature && !isAdsorption) {
      this._viewer.scene.pick(mousePosition);
      _cartesian = this._viewer.scene.pickPosition(mousePosition);
      if (_cartesian) {
        cartesian = _cartesian;
      }
    } else {
      cartesian &&
        isAdsorption &&
        (_cartesian = this._getAdsorptionPosition(
          mousePosition,
          feature,
          distance
        )); //吸附
      if (_cartesian) {
        cartesian = _cartesian;
      }
    }
  } else {
    //模型优先
    if (!objectsToExclude || objectsToExclude.length === 0) {
      feature = this._viewer.scene.pick(mousePosition);
      if (feature && feature.id && !this.id3DGraphic(feature.id)) {
        feature = undefined;
      }
    } else {
      feature = this._viewer.scene.drillPick(
        mousePosition,
        (objectsToExclude &&
          objectsToExclude.length &&
          objectsToExclude.length + 1) ||
        1,
        width,
        width
      );
      feature = this.getNotExcludedObj(feature, objectsToExclude);
    }
    if (feature && !isAdsorption) {
      this._viewer.scene.pick(mousePosition);
      cartesian = this._viewer.scene.pickPosition(mousePosition);
    } else if (feature && isAdsorption) {
      this._viewer.scene.pick(mousePosition);
      cartesian = this._viewer.scene.pickPosition(mousePosition);
      _cartesian = this._getAdsorptionPosition(
        mousePosition,
        feature,
        distance
      ); //吸附
      if (_cartesian) {
        cartesian = _cartesian;
      }
    } else {
      //开启深度检测
      this._viewer.scene.globe.depthTestAgainstTerrain = true;
      ray = this._viewer.camera.getPickRay(mousePosition);
      ray &&
        (cartesian = this._viewer.scene.globe.pick(ray, this._viewer.scene));
    }
  }
  this._viewer.scene.globe.depthTestAgainstTerrain = !!this.defaultDepthTest;
  this.defaultDepthTest = undefined;

  // console.log(cartesian);
  if (!cartesian) {
    console.log("未拾取到坐标！");
    return;
  }

  return cartesian;
};
/**
 * 获取鼠标当前经纬度
 * @param {object} [movement] 鼠标屏幕位置
 * @param {Array/Object} [objectsToExclude] 排除的实体对象
 * @param {number} [type] 类型（0为模型优先，1为地形优先）,默认模型优先
 * @param {boolean} [isAdsorption] true|false 是否吸附，默认否
 * @param {number} [distance] 吸附半径，默认30
 */
getPosition.prototype.getMouseDegrees = function (
  movement,
  objectsToExclude,
  type,
  isAdsorption,
  distance
) {
  var mousePosition = movement.endPosition || movement.position || movement;
  type === undefined && (type = 0);
  isAdsorption = this._cesium.defaultValue(isAdsorption, false);
  this.defaultDepthTest === undefined &&
    (this.defaultDepthTest =
      !!this._viewer.scene.globe.depthTestAgainstTerrain);

  var ray, cartesian, _cartesian, feature;
  //this.isObjectsToExcludeShow(objectsToExclude, false);
  var width = isAdsorption ? (distance ? distance : 30) : 1;
  if (type !== 0) {
    //地形优先
    //开启深度检测
    this._viewer.scene.globe.depthTestAgainstTerrain = true;
    ray = this._viewer.camera.getPickRay(mousePosition);
    ray && (cartesian = this._viewer.scene.globe.pick(ray, this._viewer.scene));
    //isAdsorption && (mousePosition = this.getAdsorptionPosition(mousePosition, objectsToExclude));

    if (!objectsToExclude || objectsToExclude.length === 0) {
      feature = this._viewer.scene.pick(mousePosition);
      if (feature && feature.id && !this.id3DGraphic(feature.id)) {
        feature = undefined;
      }
    } else {
      feature = this._viewer.scene.drillPick(
        mousePosition,
        (objectsToExclude &&
          objectsToExclude.length &&
          objectsToExclude.length + 1) ||
        1,
        width,
        width
      );
      feature = this.getNotExcludedObj(feature, objectsToExclude);
    }
    if (feature && !isAdsorption) {
      this._viewer.scene.pick(mousePosition);
      _cartesian = this._viewer.scene.pickPosition(mousePosition);
      if (_cartesian) {
        cartesian = _cartesian;
      }
    } else {
      cartesian &&
        isAdsorption &&
        (_cartesian = this._getAdsorptionPosition(
          mousePosition,
          feature,
          distance
        )); //吸附
      if (_cartesian) {
        cartesian = _cartesian;
      }
    }
  } else {
    //模型优先
    if (!objectsToExclude || objectsToExclude.length === 0) {
      feature = this._viewer.scene.pick(mousePosition);
      if (feature && feature.id && !this.id3DGraphic(feature.id)) {
        feature = undefined;
      }
    } else {
      feature = this._viewer.scene.drillPick(
        mousePosition,
        (objectsToExclude &&
          objectsToExclude.length &&
          objectsToExclude.length + 1) ||
        1,
        width,
        width
      );
      feature = this.getNotExcludedObj(feature, objectsToExclude);
    }
    if (feature && !isAdsorption) {
      this._viewer.scene.pick(mousePosition);
      cartesian = this._viewer.scene.pickPosition(mousePosition);
    } else if (feature && isAdsorption) {
      this._viewer.scene.pick(mousePosition);
      cartesian = this._viewer.scene.pickPosition(mousePosition);
      _cartesian = this._getAdsorptionPosition(
        mousePosition,
        feature,
        distance
      ); //吸附
      if (_cartesian) {
        cartesian = _cartesian;
      }
    } else {
      //开启深度检测
      this._viewer.scene.globe.depthTestAgainstTerrain = true;
      ray = this._viewer.camera.getPickRay(mousePosition);
      ray &&
        (cartesian = this._viewer.scene.globe.pick(ray, this._viewer.scene));
    }
  }
  this._viewer.scene.globe.depthTestAgainstTerrain = !!this.defaultDepthTest;
  this.defaultDepthTest = undefined;

  if (!cartesian) {
    console.log("未拾取到坐标！");
    return;
  }

  var cartographic = this._cesium.Cartographic.fromCartesian(cartesian);
  return {
    lon: this._cesium.Math.toDegrees(cartographic.longitude),
    lat: this._cesium.Math.toDegrees(cartographic.latitude),
    height: cartographic.height
  };
};

//判断是否是三维图形
getPosition.prototype.id3DGraphic = function (graphic) {
  let threeD = true;
  if (graphic.polyline || graphic.point || graphic.label || graphic.billboard) {
    threeD = false;
  } else if (graphic.polygon && graphic.polygon.extrudedHeight == undefined) {
    threeD = false;
  } else if (
    graphic.rectangle &&
    graphic.rectangle.extrudedHeight == undefined
  ) {
    threeD = false;
  } else if (graphic.ellipse && graphic.ellipse.extrudedHeight == undefined) {
    threeD = false;
  } else if (graphic.corridor && graphic.corridor.extrudedHeight == undefined) {
    threeD = false;
  }
  return threeD;
};

//吸附坐标-屏幕坐标
getPosition.prototype.getAdsorptionPosition = function (
  mousePosition,
  objectsToExclude
) {
  var dis = 5; //吸附半径
  var ave = 3; //采样数
  var object = this._viewer.scene.drillPick(
    mousePosition,
    (objectsToExclude &&
      objectsToExclude.length &&
      objectsToExclude.length + 1) ||
    3,
    dis + 3,
    dis + 3
  ); //3为默认拾取范围
  var need = false;
  for (var i = 0; i < object.length; i++) {
    if (object[i] && !this.isExcluded(object[i], objectsToExclude)) {
      need = true;
      break;
    }
  }

  if (need) {
    object = this._viewer.scene.pick(mousePosition, 1, 1);
    if (object && !this.isExcluded(object, objectsToExclude)) {
      return mousePosition;
    }
    for (var i = dis / ave; i <= dis; i += dis / ave) {
      object = this._viewer.scene.pick(
        { x: mousePosition.x + i, y: mousePosition.y },
        1,
        1
      );
      if (object && !this.isExcluded(object, objectsToExclude)) {
        return { x: mousePosition.x + i, y: mousePosition.y };
      }
    }
    for (var i = dis / ave; i <= dis; i += dis / ave) {
      object = this._viewer.scene.pick(
        { x: mousePosition.x + i, y: mousePosition.y + i },
        1,
        1
      );
      if (object && !this.isExcluded(object, objectsToExclude)) {
        return { x: mousePosition.x + i, y: mousePosition.y + i };
      }
    }
    for (var i = dis / ave; i <= dis; i += dis / ave) {
      object = this._viewer.scene.pick(
        { x: mousePosition.x, y: mousePosition.y + i },
        1,
        1
      );
      if (object && !this.isExcluded(object, objectsToExclude)) {
        return { x: mousePosition.x, y: mousePosition.y + i };
      }
    }
    for (var i = dis / ave; i <= dis; i += dis / ave) {
      object = this._viewer.scene.pick(
        { x: mousePosition.x - i, y: mousePosition.y + i },
        1,
        1
      );
      if (object && !this.isExcluded(object, objectsToExclude)) {
        return { x: mousePosition.x - i, y: mousePosition.y + i };
      }
    }
    for (var i = dis / ave; i <= dis; i += dis / ave) {
      object = this._viewer.scene.pick(
        { x: mousePosition.x - i, y: mousePosition.y },
        1,
        1
      );
      if (object && !this.isExcluded(object, objectsToExclude)) {
        return { x: mousePosition.x - i, y: mousePosition.y };
      }
    }
    for (var i = dis / ave; i <= dis; i += dis / ave) {
      object = this._viewer.scene.pick(
        { x: mousePosition.x - i, y: mousePosition.y - i },
        1,
        1
      );
      if (object && !this.isExcluded(object, objectsToExclude)) {
        return { x: mousePosition.x - i, y: mousePosition.y - i };
      }
    }
    for (var i = dis / ave; i <= dis; i += dis / ave) {
      object = this._viewer.scene.pick(
        { x: mousePosition.x, y: mousePosition.y - i },
        1,
        1
      );
      if (object && !this.isExcluded(object, objectsToExclude)) {
        return { x: mousePosition.x, y: mousePosition.y - i };
      }
    }
    for (var i = dis / ave; i <= dis; i += dis / ave) {
      object = this._viewer.scene.pick(
        { x: mousePosition.x + i, y: mousePosition.y - i },
        1,
        1
      );
      if (object && !this.isExcluded(object, objectsToExclude)) {
        return { x: mousePosition.x + i, y: mousePosition.y - i };
      }
    }
  }
  return mousePosition;
};

//吸附坐标
getPosition.prototype._getAdsorptionPosition = function (
  mousePosition,
  feature,
  distance
) {
  var dis = distance ? distance : 30; //吸附半径

  if (feature) {
    feature = this.getFeature(feature);
    var _PosArr = [];
    var CanvasCoordinates;
    for (var i = 0; i < feature.position.length; i++) {
      CanvasCoordinates = this._viewer.scene.cartesianToCanvasCoordinates(
        feature.position[i]
      );
      if (CanvasCoordinates) {
        CanvasCoordinates.index = i;
        _PosArr.push(CanvasCoordinates);
      }
    }
    var compare = function (obj1, obj2) {
      var val1 = obj1.x;
      var val2 = obj2.x;
      if (val1 < val2) {
        return -1;
      } else if (val1 > val2) {
        return 1;
      } else {
        return 0;
      }
    };
    _PosArr = _PosArr.sort(compare);
    if (_PosArr && _PosArr.length > 1) {
      //二分法算最接近下标
      var n = Math.log(_PosArr.length) / Math.log(2);
      var m = 0;
      var maxn = _PosArr.length;
      var minn = 0;
      var zd = -1;

      for (var i = 0; i < n; i++) {
        m = Math.floor((maxn + minn) / 2);
        if (mousePosition.x - _PosArr[m].x > dis) {
          minn = m;
        } else if (mousePosition.x - _PosArr[m].x < -dis) {
          maxn = m;
        } else if (Math.abs(mousePosition.x - _PosArr[m].x) < dis) {
          zd = m;
          break;
        }
      }
      if (zd !== -1) {
        for (var i = m; i < maxn; i++) {
          if (Math.abs(mousePosition.x - _PosArr[i].x) > dis) {
            maxn = i;
            break;
          }
        }
        for (var i = m; i > minn; i--) {
          if (Math.abs(mousePosition.x - _PosArr[i].x) > dis) {
            minn = i + 1;
            break;
          }
        }
        for (var i = minn; i < maxn; i++) {
          if (Math.abs(mousePosition.y - _PosArr[i].y) < dis) {
            return feature.position[_PosArr[i].index];
          }
        }
      }
    }
    if (_PosArr && _PosArr.length === 1) {
      if (
        Math.abs(mousePosition.x - _PosArr[0].x) < dis &&
        Math.abs(mousePosition.y - _PosArr[0].y) < dis
      ) {
        return feature.position[0];
      }
    }
  }
};

getPosition.prototype.getFeature = function (obj) {
  var position;
  var data = {
    position: [],
    object: []
  };
  if (obj && obj.id) {
    if (obj.id instanceof this._cesium.Entity) {
      var entity = obj.id;
      if (entity.billboard) {
        position = entity.position.getValue(this._viewer.clock.currentTime);
        data.position.push(position);
        data.object.push({
          type: "billboard",
          feature: entity.billboard
        });
      }
      if (entity.box) {
        position = entity.position.getValue(this._viewer.clock.currentTime);
        data.position.push(position);
        data.object.push({
          type: "box",
          feature: entity.box
        });
      }
      if (entity.corridor) {
        position = entity.position.getValue(this._viewer.clock.currentTime);
        data.position.push(position);
        data.object.push({
          type: "corridor",
          feature: entity.corridor
        });
      }
      if (entity.cylinder) {
        position = entity.position.getValue(this._viewer.clock.currentTime);
        data.position.push(position);
        data.object.push({
          type: "cylinder",
          feature: entity.cylinder
        });
      }
      if (entity.ellipse) {
        position = entity.position.getValue(this._viewer.clock.currentTime);
        data.position.push(position);
        data.object.push({
          type: "ellipse",
          feature: entity.ellipse
        });
      }
      if (entity.ellipsoid) {
        position = entity.position.getValue(this._viewer.clock.currentTime);
        data.position.push(position);
        data.object.push({
          type: "ellipsoid",
          feature: entity.ellipsoid
        });
      }
      if (entity.label) {
        position = entity.position.getValue(this._viewer.clock.currentTime);
        data.position.push(position);
        data.object.push({
          type: "label",
          feature: entity.label
        });
      }
      if (entity.model) {
        position = entity.position.getValue(this._viewer.clock.currentTime);
        data.position.push(position);
        data.object.push({
          type: "model",
          feature: entity.model
        });
      }
      if (entity.path) {
        position = entity.position.getValue(this._viewer.clock.currentTime);
        data.position.push(position);
        data.object.push({
          type: "path",
          feature: entity.path
        });
      }
      if (entity.plane) {
        position = entity.position.getValue(this._viewer.clock.currentTime);
        data.position.push(position);
        data.object.push({
          type: "plane",
          feature: entity.plane
        });
      }
      if (entity.point) {
        position = entity.position.getValue(this._viewer.clock.currentTime);
        data.position.push(position);
        data.object.push({
          type: "point",
          feature: entity.point
        });
      }
      if (entity.polygon) {
        position = entity.polygon.hierarchy.getValue(
          this._viewer.clock.currentTime
        );
        data.position = data.position.concat(position.positions);
        data.object.push({
          type: "polygon",
          feature: entity.polygon
        });
      }
      if (entity.polyline) {
        position = entity.polyline.positions.getValue(
          this._viewer.clock.currentTime
        );
        data.position = data.position.concat(position);
        data.object.push({
          type: "polyline",
          feature: entity.polyline
        });
      }
      if (entity.polylineVolume) {
        position = entity.polylineVolume.positions.getValue(
          this._viewer.clock.currentTime
        );
        data.position = data.position.concat(position);
        data.object.push({
          type: "polylineVolume",
          feature: entity.polylineVolume
        });
      }
      if (entity.rectangle) {
        position = entity.rectangle.coordinates.getValue(
          this._viewer.clock.currentTime
        );
        data.position = data.position.concat(position);
        data.object.push({
          type: "rectangle",
          feature: entity.rectangle
        });
      }
      if (entity.wall) {
        position = entity.wall.positions.getValue(
          this._viewer.clock.currentTime
        );
        data.position = data.position.concat(position);
        data.object.push({
          type: "wall",
          feature: entity.wall
        });
      }
    }
  }
  if (obj && obj.primitive) {
    if (obj.primitive instanceof this._cesium.Model) {
      position = obj.primitive.positionObj;
      data.position.push(position);
      data.object.push({
        type: "model",
        feature: obj.primitive
      });
    }
  }
  return data;
};

//是否包含对象
getPosition.prototype.isExcluded = function (object, objectsToExclude) {
  if (
    !this._cesium.defined(object) ||
    !this._cesium.defined(objectsToExclude) ||
    objectsToExclude.length === 0
  ) {
    return false;
  }
  return (
    objectsToExclude.indexOf(object) > -1 ||
    objectsToExclude.indexOf(object.primitive) > -1 ||
    objectsToExclude.indexOf(object.id) > -1
  );
};

//获取不包含的对象
getPosition.prototype.getNotExcludedObj = function (
  objectOrArr,
  objectsToExclude
) {
  if (objectOrArr.length === 0) {
    return false;
  } else if (
    !this._cesium.defined(objectsToExclude) ||
    objectsToExclude.length === 0
  ) {
    return objectOrArr;
  }
  for (var i = 0; i < objectOrArr.length; i++) {
    if (objectOrArr[i] && !this.isExcluded(objectOrArr[i], objectsToExclude)) {
      return objectOrArr[i];
    }
  }
  return false;
};

//控制对象显隐
getPosition.prototype.isObjectsToExcludeShow = function (
  objectsToExclude,
  isShow
) {
  if (
    !this._cesium.defined(objectsToExclude) ||
    objectsToExclude.length === 0
  ) {
    return;
  }
  if (objectsToExclude instanceof Array) {
    objectsToExclude.forEach(function (item) {
      item.show = isShow;
    });
  } else {
    objectsToExclude.show = isShow;
  }
};
export default getPosition;
