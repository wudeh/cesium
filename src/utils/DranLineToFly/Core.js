/**
 * 工具类
 * @constructor xp
 * @alias Core
 * @constructor
 *
 */
function Core () { }

//根据经纬度获取高度
Core.prototype.getHeightsFromLonLat = function (
  positions,
  Cesium,
  Viewer,
  callback
) {
  var camera = Viewer.camera;
  var heights = [];
  if (
    Viewer.scene &&
    Viewer.scene.terrainProvider &&
    Viewer.scene.terrainProvider._layers
  ) {
    //根据经纬度计算出地形高度。
    var promise = Cesium.sampleTerrainMostDetailed(
      Viewer.terrainProvider,
      positions
    );
    // var cameraHeight = camera.positionCartographic.height;
    Cesium.when(promise, function (updatedPositions) {
      updatedPositions.forEach(function (item) {
        heights.push(item.height);
      });
      if (typeof callback === "function") {
        callback(heights);
      }
    });
  } else {
    positions.forEach(function (p) {
      heights.push(Viewer.scene.globe.getHeight(p));
    });
    if (typeof callback === "function") {
      callback(heights);
    }
  }
};

/**
 * 创建鼠标Tooltip提示框。
 *
 * @param {*} [styleOrText] 提示框样式或文本内容
 * @param {String} [styleOrText.origin='center'] 对齐方式(center/top/bottom)
 * @param {String} [styleOrText.color='black'] 提示框颜色(black/white/yellow)
 * @param {String} [styleOrText.id=undefined] 提示框唯一id(可选)
 * @param {Object} position 显示位置
 * @param {Boolean} show 是否显示(如果为true，styleOrText必须为显示的文本内容)
 * @returns {Tooltip} Tooltip提示框。
 *
 * @example
 * sgworld.Core.CreateTooltip('这里是提示信息', {x:500, y:500}, true);
 * 或
 * tooltip = sgworld.Core.CreateTooltip();
 * tooltip.showAt({x:500, y:500}, '这里是提示信息');
 *
 * tooltip.show(false); //隐藏提示框
 * tooltip.show(true); //显示提示框
 */
Core.prototype.CreateTooltip = function (styleOrText = {}, position, show) {
  var style, _x, _y, _color, id;
  if (typeof styleOrText === "object") {
    style = styleOrText;
  }
  if (style && style.origin) {
    style.origin === "center" && ((_x = 15), (_y = -12));
    style.origin === "top" && ((_x = 15), (_y = -44));
    style.origin === "bottom" && ((_x = 15), (_y = 20));
  } else {
    (_x = 15), (_y = 20);
  }
  if (style && style.color) {
    style.color === "white" &&
      (_color = "background: rgba(255, 255, 255, 0.8);color: black;");
    style.color === "black" &&
      (_color = "background: rgba(0, 0, 0, 0.5);color: white;");
    style.color === "yellow" &&
      (_color =
        "color: black;background-color: #ffcc33;border: 1px solid white;");
  } else {
    _color = "background: rgba(0, 0, 0, 0.5);color: white;";
  }
  if (style && style.id) {
    id = "toolTip" + style.id;
  } else {
    id = "toolTip";
  }

  var tooltip = document.getElementById(id);

  if (!tooltip) {
    // 创建一个新的 div 元素
    var elementbottom = document.createElement("div");
    // 将元素添加到 .cesium-viewer 容器中
    var cesiumViewer = document.querySelector(".cesium-viewer");
    if (cesiumViewer) {
      cesiumViewer.appendChild(elementbottom);
    }

    // 构建 HTML 字符串
    var html =
      '<div id="' +
      id +
      '" style="display: none;pointer-events: none;position: absolute;z-index: 1000;opacity: 0.8;border-radius: 4px;padding: 4px 8px;white-space: nowrap;font-family:黑体;color:white;font-weight: bolder;font-size: 14px;' +
      _color +
      '"></div>';

    // 创建一个临时容器来解析 HTML 字符串
    var tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // 将解析后的第一个子元素（即 tooltip）添加到 .cesium-viewer 容器中
    if (cesiumViewer) {
      cesiumViewer.appendChild(tempDiv.firstElementChild);
    }

    // 获取刚刚创建的 tooltip 元素
    tooltip = document.getElementById(id);
  }
  if (show) {
    tooltip.innerHTML = styleOrText;
    tooltip.style.left = position.x + _x + "px";
    tooltip.style.top = position.y + _y + "px";
    tooltip.style.display = "block";
  } else {
    tooltip.style.display = "none";
  }
  return {
    tooltip: tooltip,
    style: style,
    showAt: function (position, text) {
      this.tooltip.innerHTML = text;
      if (this.style && this.style.origin) {
        this.style.origin === "center" &&
          ((_x = 15), (_y = -this.tooltip.offsetHeight / 2));
        this.style.origin === "top" &&
          ((_x = 15), (_y = -this.tooltip.offsetHeight - 20));
        this.style.origin === "bottom" && ((_x = 15), (_y = 20));
      } else {
        (_x = 15), (_y = -this.tooltip.offsetHeight / 2);
      }
      this.tooltip.style.left = position.x + _x + "px";
      this.tooltip.style.top = position.y + _y + "px";
      this.tooltip.style.display = "block";
    },
    show: function (show) {
      if (show) {
        this.tooltip.style.display = "block";
      } else {
        this.tooltip.style.display = "none";
      }
    }
  };
};

/**
 * 修改鼠标样式。
 *
 * @param {DOM} container html DOM节点
 * @param {Number} [cursorstyle=0] 鼠标类型（0为默认，1为使用cur图标）
 * @param {String} url cur图标路径。
 *
 * @example
 * sgworld.Core.mouse(Viewer.container, 1, 'draw.cur');
 */
Core.prototype.mouse = function (container, cursorstyle, url) {
  if (cursorstyle == 1) {
    container.style.cursor = "url(" + url + "),auto";
  } else {
    container.style.cursor = "default";
  }
};

// 判断是否为手机浏览器
Core.prototype.getBrowser = function () {
  var ua = navigator.userAgent.toLowerCase();
  var btypeInfo = (ua.match(/firefox|chrome|safari|opera/g) || "other")[0];
  if ((ua.match(/msie|trident/g) || [])[0]) {
    btypeInfo = "msie";
  }
  var pc = "";
  var prefix = "";
  var plat = "";
  //如果没有触摸事件 判定为PC
  var isTocuh =
    "ontouchstart" in window ||
    ua.indexOf("touch") !== -1 ||
    ua.indexOf("mobile") !== -1;
  if (isTocuh) {
    if (ua.indexOf("ipad") !== -1) {
      pc = "pad";
    } else if (ua.indexOf("mobile") !== -1) {
      pc = "mobile";
    } else if (ua.indexOf("android") !== -1) {
      pc = "androidPad";
    } else {
      pc = "pc";
    }
  } else {
    pc = "pc";
  }
  switch (btypeInfo) {
    case "chrome":
    case "safari":
    case "mobile":
      prefix = "webkit";
      break;
    case "msie":
      prefix = "ms";
      break;
    case "firefox":
      prefix = "Moz";
      break;
    case "opera":
      prefix = "O";
      break;
    default:
      prefix = "webkit";
      break;
  }
  plat =
    ua.indexOf("android") > 0 ? "android" : navigator.platform.toLowerCase();
  return {
    version: (ua.match(/[\s\S]+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1], //版本
    plat: plat, //系统
    type: btypeInfo, //浏览器
    pc: pc,
    prefix: prefix, //前缀
    isMobile: pc == "pc" ? false : true //是否是移动端
  };
};

//空间距离测量用米
Core.prototype.getSpaceDistancem = function (positions, Cesium) {
  var distance = 0;
  for (var i = 0; i < positions.length - 1; i++) {
    var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
    var point2cartographic = Cesium.Cartographic.fromCartesian(
      positions[i + 1]
    );
    /**根据经纬度计算出距离**/
    var geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(point1cartographic, point2cartographic);
    var s = geodesic.surfaceDistance;
    //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
    //返回两点之间的距离
    s = Math.sqrt(
      Math.pow(s, 2) +
      Math.pow(point2cartographic.height - point1cartographic.height, 2)
    );
    distance = distance + s;
  }
  return distance.toFixed(2);
};

//根据位置(Cartographic)获取3DTiles和Primitives高度
Core.prototype.get3DTileOrPrimitivesHeights = function (position, Viewer) {
  return Viewer.scene.sampleHeight(position);
};

//剖面分析
Core.prototype.getPmfxPro = function (
  _positions,
  pointSum1,
  cyjj,
  Cesium,
  viewer,
  methond
) {
  let _this = this;
  //起止点相关信息
  let pmx = {
    gcs: [],
    min: 99999,
    max: 0,
    juli: 0.0,
    cys: 0
  };
  let positions = [];
  let pointNum = [];
  //获取总间隔点数和距离
  for (let i = 0; i < _positions.length - 1; i++) {
    let julifr = _this.getSpaceDistancem(
      [_positions[i], _positions[i + 1]],
      Cesium
    );
    julifr = parseFloat(julifr);
    pmx.juli += julifr;
    if (cyjj == 0) {
    } else {
      pointSum1 = parseInt(julifr / cyjj);
    }
    pointNum.push(pointSum1);
    pmx.cys += pointSum1;
  }
  let startAnalyse = () => {
    pointNum.forEach((num, i) => {
      let startPoint = _positions[i];
      let endPoint = _positions[i + 1];
      //起点
      let scartographic = Cesium.Cartographic.fromCartesian(startPoint);
      let slongitude = Cesium.Math.toDegrees(scartographic.longitude);
      let slatitude = Cesium.Math.toDegrees(scartographic.latitude);

      //终点
      let ecartographic = Cesium.Cartographic.fromCartesian(endPoint);
      let elongitude = Cesium.Math.toDegrees(ecartographic.longitude);
      let elatitude = Cesium.Math.toDegrees(ecartographic.latitude);

      let pointSum = num; //取样点个数
      let addXTT =
        Cesium.Math.lerp(slongitude, elongitude, 1.0 / pointSum) - slongitude;
      let addYTT =
        Cesium.Math.lerp(slatitude, elatitude, 1.0 / pointSum) - slatitude;

      let Cartesian;

      i === 0 && positions.push(scartographic);
      for (let j = 0; j < pointSum; j++) {
        let longitude = slongitude + (j + 1) * addXTT;
        let latitude = slatitude + (j + 1) * addYTT;
        Cartesian = Cesium.Cartesian3.fromDegrees(longitude, latitude);
        positions.push(Cesium.Cartographic.fromCartesian(Cartesian));
      }
    });

    positions.push(
      Cesium.Cartographic.fromCartesian(_positions[_positions.length - 1])
    );

    let heightArr = [];
    pmx.allPoint = positions;
    this.getHeightsFromLonLat(positions, Cesium, viewer, function (data) {
      if (data) {
        heightArr = data;
        let changeDepthTest = viewer.scene.globe.depthTestAgainstTerrain;
        viewer.scene.globe.depthTestAgainstTerrain = true;
        for (let i = 0; i < heightArr.length; i++) {
          let modelHeight = _this.get3DTileOrPrimitivesHeights(
            positions[i],
            viewer
          );
          if (modelHeight !== undefined) {
            heightArr[i] = modelHeight;
          }
          let he = heightArr[i].toFixed(2);
          if (parseFloat(he) < parseFloat(pmx.min)) {
            pmx.min = parseFloat(he);
          }
          if (parseFloat(he) > parseFloat(pmx.max)) {
            pmx.max = parseFloat(he);
          }
          pmx.gcs.push(he);
        }
        viewer.scene.globe.depthTestAgainstTerrain = changeDepthTest;
        methond && typeof methond == "function" && methond(pmx);
      }
    });
  };
  if (pmx.cys > 1000) {
    layuiLayer &&
      layuiLayer.msg("当前采样点数过多，是否继续分析？", {
        time: 0,
        btn: ["继续", "取消"],
        btnAlign: "c",
        yes: index => {
          layuiLayer.close(index);
          setTimeout(() => {
            startAnalyse();
          }, 10);
        },
        btn2: () => {
          methond && typeof methond == "function" && methond(pmx);
        }
      });
  } else {
    setTimeout(() => {
      startAnalyse();
    }, 10);
  }
};

/**
 * 获取uuid
 */
Core.prototype.uuid = function (len, radix) {
  var chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  var uuid = [],
    i;
  var uuid = [],
    i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    var r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
    uuid[14] = "4";

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join("");
};

Core.prototype.getuid = function () {
  // var idStr = Date.now().toString(36);
  // idStr += Math.random().toString(36).substr(3);
  // return idStr;

  // return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  //     var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
  //     return v.toString(16);
  // });

  return this.uuid(8, 16);
};

/**
 * 对象参数合并
 * @param {Object} o 对象
 * @param {Object} n 被合并的对象
 * @param {Boolean} [override=false] 是否覆盖原属性值
 * @param {Boolean} [mergeTheSame=false] 是否只合并相同属性
 */
Core.prototype.extend = function (
  o,
  n,
  override = false,
  mergeTheSame = false
) {
  for (var key in n) {
    if (mergeTheSame) {
      if (o.hasOwnProperty(key)) {
        o[key] = n[key];
      }
    } else {
      if (!o.hasOwnProperty(key) || override) {
        o[key] = n[key];
      }
    }
  }
  return o;
};

/**
 * 两点方位角
 * @param {number} lon1 起点经度
 * @param {number} lat1 起点纬度
 * @param {number} lon2 终点经度
 * @param {number} lat2 终点纬度
 */
Core.prototype.TwoPointAzimuth = function (lon1, lat1, lon2, lat2) {
  var result = 0.0;
  var getRad = function (d) {
    return (d * Math.PI) / 180.0;
  };

  var ilat1 = Math.round(0.5 + lat1 * 360000.0);
  var ilat2 = Math.round(0.5 + lat2 * 360000.0);
  var ilon1 = Math.round(0.5 + lon1 * 360000.0);
  var ilon2 = Math.round(0.5 + lon2 * 360000.0);

  lat1 = getRad(lat1);
  lon1 = getRad(lon1);
  lat2 = getRad(lat2);
  lon2 = getRad(lon2);

  if (ilat1 === ilat2 && ilon1 === ilon2) {
    return result;
  } else if (ilon1 === ilon2) {
    if (ilat1 > ilat2) result = 180.0;
  } else {
    var c = Math.acos(
      Math.sin(lat2) * Math.sin(lat1) +
      Math.cos(lat2) * Math.cos(lat1) * Math.cos(lon2 - lon1)
    );
    var A = Math.asin((Math.cos(lat2) * Math.sin(lon2 - lon1)) / Math.sin(c));
    result = (A * 180) / Math.PI;
    if (ilat2 > ilat1 && ilon2 > ilon1) {
    } else if (ilat2 < ilat1 && ilon2 < ilon1) {
      result = 180.0 - result;
    } else if (ilat2 < ilat1 && ilon2 > ilon1) {
      result = 180.0 - result;
    } else if (ilat2 > ilat1 && ilon2 < ilon1) {
      result += 360.0;
    }
  }
  return result;
};
export default Core;
