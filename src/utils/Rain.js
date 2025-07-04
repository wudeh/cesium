import * as Cesium from 'cesium';
/**
 * 全屏雨天效果
 * @param {*} viewer 
 */
export class RainAll {
    viewer;
    rain;
    constructor(viewer) {
        this.viewer = viewer;
        this.init();
    }
    init() {
        // 添加雨天效果
        //  雨天---着色器
        let rainFS = 	`
        uniform sampler2D colorTexture;
        varying vec2 v_textureCoordinates;

        float hash(float x){
            return fract(sin(x*133.3)*13.13);
        }

        void main(void){ 
            float time = czm_frameNumber / 60.0;
            vec2 resolution = czm_viewport.zw;

            vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
            vec3 c=vec3(.6,.7,.8);

            float a= -.4;
            float si=sin(a),co=cos(a);
            uv*=mat2(co,-si,si,co);
            uv*=length(uv+vec2(0,4.9))*.3+1.;

            float v=1.-sin(hash(floor(uv.x*100.))*2.);
            float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;
            c*=v*b; 

            gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.5);  
        }                
        `
        let rain = new Cesium.PostProcessStage({
            fragmentShader: rainFS
        });
        this.rain = rain;
        // <!-- 加载雨着色器代码 -->
        this.viewer.scene.postProcessStages.add(rain);
    }
    /**
     * 清除雨天效果
     */
    clear() {
        // <!-- 卸载雨着色器代码 -->
        this.viewer.scene.postProcessStages.remove(this.rain);
    }
    /**
     * 切换雨天效果
     */
    startRain() {
        // <!-- 加载雨着色器代码 -->
        this.viewer.scene.postProcessStages.add(this.rain);
    }
}



export class RainEffect {
  constructor(viewer, options) {
    if (!viewer) throw new Error("no viewer object!");
    options = options || {};
    //倾斜角度，负数向右，正数向左
    this.tiltAngle = Cesium.defaultValue(options.tiltAngle, -0.6);
    this.rainSize = Cesium.defaultValue(options.rainSize, 0.3);
    this.rainSpeed = Cesium.defaultValue(options.rainSpeed, 60.0);
    this.viewer = viewer;
    this.init();
  }

  init() {
    this.rainStage = new Cesium.PostProcessStage({
      name: "czm_rain",
      fragmentShader: this.rain(),
      uniforms: {
        tiltAngle: () => {
          return this.tiltAngle;
        },
        rainSize: () => {
          return this.rainSize;
        },
        rainSpeed: () => {
          return this.rainSpeed;
        },
      },
    });
    this.viewer.scene.postProcessStages.add(this.rainStage);
  }

  destroy() {
    if (!this.viewer || !this.rainStage) return;
    this.viewer.scene.postProcessStages.remove(this.rainStage);
    const isDestroyed = this.rainStage.isDestroyed();
    // 先检查是否被销毁过，如果已经被销毁过再调用destroy会报错
    if (!isDestroyed) {
      this.rainStage.destroy();
    }
    delete this.tiltAngle;
    delete this.rainSize;
    delete this.rainSpeed;
  }

  show(visible) {
    this.rainStage.enabled = visible;
  }

  rain() {
    return "uniform sampler2D colorTexture;\n\
              in vec2 v_textureCoordinates;\n\
              uniform float tiltAngle;\n\
              uniform float rainSize;\n\
              uniform float rainSpeed;\n\
              float hash(float x) {\n\
                  return fract(sin(x * 133.3) * 13.13);\n\
              }\n\
              out vec4 fragColor;\n\
              void main(void) {\n\
                  float time = czm_frameNumber / rainSpeed;\n\
                  vec2 resolution = czm_viewport.zw;\n\
                  vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);\n\
                  vec3 c = vec3(.6, .7, .8);\n\
                  float a = tiltAngle;\n\
                  float si = sin(a), co = cos(a);\n\
                  uv *= mat2(co, -si, si, co);\n\
                  uv *= length(uv + vec2(0, 4.9)) * rainSize + 1.;\n\
                  float v = 1. - sin(hash(floor(uv.x * 100.)) * 2.);\n\
                  float b = clamp(abs(sin(20. * time * v + uv.y * (5. / (2. + v)))) - .95, 0., 1.) * 20.;\n\
                  c *= v * b;\n\
                  fragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(c, 1), .5);\n\
              }\n\
              ";
  }
}
