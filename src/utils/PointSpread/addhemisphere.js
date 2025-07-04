import * as Cesium from 'cesium';

let viewer;
 
export default {

  addHemisphere(radius, color) {
    const entities = viewer.entities;
 
    class LineFlowMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = options.color;
        this._startingpos = 0.0;
 
 
        let upStartingpos = ()=>{
          requestAnimationFrame(()=>{
            this._startingpos -= 0.001;
            upStartingpos();
          })
        }
 
        upStartingpos();
      }
 
      get isConstant() {
        return false;
      }
 
      get definitionChanged() {
        return this._definitionChanged;
      }
 
      getType(time) {
        return Cesium.Material.LineFlowMaterialType;
      }
 
      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }
        result.color = this._color;
        result.startingpos = this._startingpos;
 
        // result.color = Cesium.Color.fromRandom({ alpha: 1.0 });
        return result
      }
 
      equals(other) {
        return (this === other || (other instanceof LineFlowMaterialProperty && Cesium.Property.equals(this._color, other._color) ))
      }
    }
 
    Object.defineProperties(LineFlowMaterialProperty.prototype, {color: Cesium.createPropertyDescriptor('color'), startingpos: Cesium.createPropertyDescriptor('startingpos')})
    Cesium.Material.LineFlowMaterialProperty = 'LineFlowMaterialProperty';
    Cesium.Material.LineFlowMaterialType = 'LineFlowMaterialType';
    Cesium.Material.LineFlowMaterialSource = `    
            uniform vec4 color;  
            uniform float startingpos;
             czm_material czm_getMaterial(czm_materialInput materialInput){
                 czm_material material = czm_getDefaultMaterial(materialInput); 
                  vec2 st = materialInput.st;
                 material.emission = color.rgb;
                 float fernal = pow((1.0 - abs(dot(normalize(materialInput.normalEC), normalize(materialInput.positionToEyeEC)))), 3.0) + 0.1;
                 if (st.t > 0.5) {
                    material.alpha = fernal * (mod(st.t + startingpos, 0.5) + 0.5) * (mod(st.s + startingpos, 1.0) + 0.5);
                 } else {
                    material.alpha = 0.0;
                 }
                 return material;    
            }    `
    Cesium.Material._materialCache.addMaterial(
      Cesium.Material.LineFlowMaterialType, 
      {
        fabric: {
          type: Cesium.Material.LineFlowMaterialType, 
          uniforms: {
            color: Cesium.Color.fromRandom({ alpha: 1.0 }), 
            startingpos:0.1
          },
          source: Cesium.Material.LineFlowMaterialSource
        },
        translucent: function (material) {
          return true;
        }
    })
 
    // entities.add({
    //   position: Cesium.Cartesian3.fromDegrees( position.longitude, position.latitude, 0),
    //   ellipsoid: {
    //     radii: new Cesium.Cartesian3(radius, radius, radius),
    //     outline: false,
    //     outlineColor: Cesium.Color.WHITE,
    //     outlineWidth: 2,
    //     material: new LineFlowMaterialProperty({color:new Cesium.Color(1.0, 0.0, 0.0, 1)}),
    //   },
    // });
 
    return {
      radii: new Cesium.Cartesian3(radius, radius, radius),
      outline: false,
      outlineColor: Cesium.Color.WHITE,
      allowPicking:false,
      outlineWidth: 2,
      material: new LineFlowMaterialProperty({color:color}),
    };
  },
  addLine(color,speed){
    /*
 * @Description: 飞线效果（参考开源代码）
 * @Version: 1.0
 * @Author: Julian
 * @Date: 2022-03-05 16:13:21
 * @LastEditors: Julian
 * @LastEditTime: 2022-03-05 17:39:38
 */
    class LineFlowMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = color;
        this._speed = speed;
        this._percent = undefined;
        this._gradient = undefined;
        this.color = options.color;
        this.speed = options.speed;
        this.percent = options.percent;
        this.gradient = options.gradient;
      }
 
      get isConstant() {
        return false;
      }
 
      get definitionChanged() {
        return this._definitionChanged;
      }
 
      getType(time) {
        return Cesium.Material.LineFlowMaterialType;
      }
 
      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }
 
        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 5.0, result.speed);
        result.percent = Cesium.Property.getValueOrDefault(this._percent, time, 0.1, result.percent);
        result.gradient = Cesium.Property.getValueOrDefault(this._gradient, time, 0.01, result.gradient);
        return result
      }
 
      equals(other) {
        return (this === other ||
            (other instanceof LineFlowMaterialProperty &&
                Cesium.Property.equals(this._color, other._color) &&
                Cesium.Property.equals(this._speed, other._speed) &&
                Cesium.Property.equals(this._percent, other._percent) &&
                Cesium.Property.equals(this._gradient, other._gradient))
        )
      }
    }
 
    Object.defineProperties(LineFlowMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed'),
      percent: Cesium.createPropertyDescriptor('percent'),
      gradient: Cesium.createPropertyDescriptor('gradient'),
    })
 
    // Cesium.LineFlowMaterialProperty = LineFlowMaterialProperty;
    Cesium.Material.LineFlowMaterialProperty = 'LineFlowMaterialProperty';
    Cesium.Material.LineFlowMaterialType = 'LineFlowMaterialType';
    Cesium.Material.LineFlowMaterialSource =
        `
    uniform vec4 color;
    uniform float speed;
    uniform float percent;
    uniform float gradient;
    
    czm_material czm_getMaterial(czm_materialInput materialInput){
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      float t =fract(czm_frameNumber * speed / 1000.0);
      t *= (1.0 + percent);
      float alpha = smoothstep(t- percent, t, st.s) * step(-t, -st.s);
      alpha += gradient;
      material.diffuse = color.rgb;
      material.alpha = alpha;
      return material;
    }
    `
 
    Cesium.Material._materialCache.addMaterial(Cesium.Material.LineFlowMaterialType, {
      fabric: {
        type: Cesium.Material.LineFlowMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 10.0,
          percent: 0.1,
          gradient: 0.01
        },
        source: Cesium.Material.LineFlowMaterialSource
      },
      translucent: function(material) {
        return true;
      }
    })
    return {
      material: new LineFlowMaterialProperty({color:color,speed:speed}),
    };
 
  },
  addDynamicWall(positions, color) {
    let clientX = 0;
    let clientY = 0;
 
    if (!window['theposition']) {
      window['_begintime'] = Date.now();
    }
 
    var tpos = Cesium.Cartesian3.fromDegrees(positions[0], positions[1], 100);
 
    class WallFlowMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = options.color;
        this._startingpos = 0.0;
        this._clientX = -1.0;
        this._clientY = -1.0;
        this._tposx = tpos.x;
        this._tposy = tpos.y;
        this._tposz = tpos.z;
        this._begintime = window['_begintime'];
 
        let upStartingpos = ()=>{
          requestAnimationFrame(()=>{
            this._startingpos -= 0.009;
            if (clientX)
              this._clientX = clientX;
 
            if (clientY)
              this._clientY = clientY;
 
            upStartingpos();
          })
        }
 
        upStartingpos();
 
 
        // setInterval(()=>{
        //   this._startingpos += 0.01;
        // },100);
      }
 
      get isConstant() {
        return false;
      }
 
      get definitionChanged() {
        return this._definitionChanged;
      }
 
      getType(time) {
        return Cesium.Material.WallFlowMaterialType;
      }
 
      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }
        result.color = this._color;
        result.startingpos = this._startingpos;
        result.clientx = this._clientX;
        result.clienty = this._clientY;
        result.tposx = this._tposx;
        result.tposy = this._tposy;
        result.tposz = this._tposz;
        result.ttime =  (Date.now() - this._begintime) / 100;
        result.begintime = 0.1;
 
        // result.color = Cesium.Color.fromRandom({ alpha: 1.0 });
        return result
      }
 
      equals(other) {
        return (this === other || (other instanceof WallFlowMaterialProperty && Cesium.Property.equals(this._color, other._color) ))
      }
    }
 
    Object.defineProperties(WallFlowMaterialProperty.prototype, {color: Cesium.createPropertyDescriptor('color')
      , startingpos: Cesium.createPropertyDescriptor('startingpos')
      , clientx: Cesium.createPropertyDescriptor('clientx')
      , clienty: Cesium.createPropertyDescriptor('clienty')
      , tposx: Cesium.createPropertyDescriptor('tposx')
      , tposy: Cesium.createPropertyDescriptor('tposy')
      , tposz: Cesium.createPropertyDescriptor('tposz')
      , ttime: Cesium.createPropertyDescriptor('ttime')
      , begintime: Cesium.createPropertyDescriptor('begintime')
    })
    Cesium.Material.WallFlowMaterialProperty = 'WallFlowMaterialProperty';
    Cesium.Material.WallFlowMaterialType = 'WallFlowMaterialType';
    Cesium.Material.WallFlowMaterialSource = `    
            uniform vec4 color;  
            uniform float startingpos;
            uniform float clientx;
            uniform float clienty;
            uniform float tposx;
            uniform float tposy;
            uniform float tposz;
            uniform float ttime;
            uniform float begintime;
             czm_material czm_getMaterial(czm_materialInput materialInput){
                 czm_material material = czm_getDefaultMaterial(materialInput); 
                  vec2 st = materialInput.st;
                  
                 float thedist = distance(gl_FragCoord.xy, vec2(clientx,clienty));
                 
                 
                  vec3 worldPosition = (czm_inverseView * vec4(-materialInput.positionToEyeEC, 1.0)).xyz;
                 float theposdist = distance(worldPosition, vec3(tposx,tposy,tposz));
                 material.emission = color.rgb;
                 // material.emission =  3.0 * clamp(1.0 / (abs(theposdist - (ttime - begintime)) / 1000.0), 0.5, 5.0) * clamp(pow((1.5 - (thedist / 400.0)), 3.0), 1.0, 5.5) * smoothstep(0.2, 0.8, st.t) * color.rgb;
                 // material.emission = color.rgb * clamp((smoothstep(0.0, 0.007,sin((theposdist / 50.0 - ttime * 4.0) / 10.0) - 0.995) + 1.0) * 3.0, 0.0, 5.0);
                 //  material.emission = color.rgb * 2.0;
                 
                 float fernal = pow((1.0 - abs(dot(normalize(materialInput.normalEC), normalize(materialInput.positionToEyeEC)))), 2.0) + 0.2;
                 // if (st.t > 0.5) {
                    material.alpha = max(0.0, (mod(st.t + startingpos, 1.0) - 0.1));
                 // } else {
                 //    material.alpha = 1.0;
                 // }
                 return material;    
            }    `
    Cesium.Material._materialCache.addMaterial(Cesium.Material.WallFlowMaterialType, {
      fabric: {type: Cesium.Material.WallFlowMaterialType, uniforms: {color: Cesium.Color.fromRandom({ alpha: 1.0 }), startingpos:0.1, clientx: -1.0, clienty:-1.0, tposx:0, tposy:0, tposz:0.1, ttime:0, begintime:0.1},
        source: Cesium.Material.WallFlowMaterialSource},
      translucent: function (material) {
        return true;
      }
    })
 
 
    /*viewer.entities.add({
      name: "立体墙效果",
      wall: {
        positions: Cesium.Cartesian3.fromDegreesArray(positions),  // 墙体位置及高度
        maximumHeights: new Array(positions.length / 2).fill(1000),
        minimumHeights: new Array(positions.length / 2).fill(0),
        // material:new WallFlowMaterialProperty({color:color}),
        material:new WallFlowMaterialProperty({color:color}),
      },
    })*/
    return new WallFlowMaterialProperty({color:color});
  },
  addCircle(outViewer, options,color,count,gradient){
    viewer = outViewer;
    class CircleRippleMaterialProperty {
      constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
        this.count = options.count;
        this.gradient = options.gradient;
      };
 
      get isConstant() {
        return false;
      }
 
      get definitionChanged() {
        return this._definitionChanged;
      }
 
      getType(time) {
        return Cesium.Material.CircleRippleMaterialType;
      }
 
      getValue(time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }
 
        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
        result.count = this.count;
        result.gradient = this.gradient;
        return result
      }
 
      equals(other) {
        return (this === other ||
            (other instanceof CircleRippleMaterialProperty &&
                Cesium.Property.equals(this._color, other._color) &&
                Cesium.Property.equals(this._speed, other._speed) &&
                Cesium.Property.equals(this.count, other.count) &&
                Cesium.Property.equals(this.gradient, other.gradient))
        )
      }
    }
 
    Object.defineProperties(CircleRippleMaterialProperty.prototype, {
      color: Cesium.createPropertyDescriptor('color'),
      speed: Cesium.createPropertyDescriptor('speed'),
      count: Cesium.createPropertyDescriptor('count'),
      gradient: Cesium.createPropertyDescriptor('gradient')
    })
 
    // Cesium.CircleRippleMaterialProperty = CircleRippleMaterialProperty;
    Cesium.Material.CircleRippleMaterialProperty = 'CircleRippleMaterialProperty';
    Cesium.Material.CircleRippleMaterialType = 'CircleRippleMaterialType';
    Cesium.Material.CircleRippleMaterialSource = `
                                            uniform vec4 color;
                                            uniform float speed;
                                            uniform float count;
                                            uniform float gradient;
                                            czm_material czm_getMaterial(czm_materialInput materialInput)
                                            {
                                            czm_material material = czm_getDefaultMaterial(materialInput);
                                            material.diffuse = 1.5 * color.rgb;
                                            vec2 st = materialInput.st;
                                            float dis = distance(st, vec2(0.5, 0.5));
                                            float per = fract(czm_frameNumber * speed / 1000.0);
                                            if(count == 1.0){
                                                if(dis > per * 0.5){
                                                discard;
                                                }else {
                                                material.alpha = color.a  * dis / per / 2.0;
                                                }
                                            } else {
                                                vec3 str = materialInput.str;
                                                if(abs(str.z)  > 0.001){
                                                discard;
                                                }
                                                if(dis > 0.5){
                                                discard;
                                                } else {
                                                float perDis = 0.5 / count;
                                                float disNum;
                                                float bl = 0.0;
                                                for(int i = 0; i <= 999; i++){
                                                    if(float(i) <= count){
                                                    disNum = perDis * float(i) - dis + per / count;
                                                    if(disNum > 0.0){
                                                        if(disNum < perDis){
                                                        bl = 1.0 - disNum / perDis;
                                                        }
                                                        else if(disNum - perDis < perDis){
                                                        bl = 1.0 - abs(1.0 - disNum / perDis);
                                                        }
                                                        material.alpha = pow(bl,(1.0 + 10.0 * (1.0 - gradient)));
                                                    }
                                                    }
                                                }
                                                }
                                            }
                                            return material;
                                            }
                                            `
 
    Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleRippleMaterialType, {
      fabric: {
        type: Cesium.Material.CircleRippleMaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 3.0,
          count: 4,
          gradient: 0.2
        },
        source: Cesium.Material.CircleRippleMaterialSource
      },
      translucent: function(material) {
        return true;
      }
    })
    return new CircleRippleMaterialProperty(options,color,count,gradient);
  },
}