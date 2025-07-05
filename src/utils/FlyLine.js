import * as Cesium from "cesium";
import { setPathData } from "./BeiSaiEr";

let FlowingLineMaterialGLSL =
  "float SPEED_STEP = 0.01; \n" +
  "vec4 drawLight(float xPos, vec2 st, float headOffset, float tailOffset, float widthOffset){ \n" +
  "float lineLength = smoothstep(xPos + headOffset, xPos, st.x) - smoothstep(xPos, xPos - tailOffset, st.x); \n" +
  "float lineWidth = smoothstep(widthOffset, 0.5, st.y) - smoothstep(0.5, 1.0 - widthOffset, st.y); \n" +
  "return vec4(lineLength * lineWidth); \n" +
  "}\n" +
  "czm_material czm_getMaterial(czm_materialInput materialInput) \n" +
  "{ \n" +
  "czm_material m = czm_getDefaultMaterial(materialInput);\n" +
  "float sinTime = sin(czm_frameNumber * SPEED_STEP * speed); \n" +
  "vec4 v4_core;\n" +
  "vec4 v4_color;\n" +
  "float xPos = 0.0; \n" +
  "if (sinTime < 0.0){ \n" +
  "xPos = cos(czm_frameNumber * SPEED_STEP * speed)+ 1.0 - tailsize; \n" +
  "}else{ \n" +
  "xPos = -cos(czm_frameNumber * SPEED_STEP * speed)+ 1.0 - tailsize; \n" +
  "} \n" +
  "v4_color = drawLight(xPos, materialInput.st, headsize, tailsize, widthoffset);\n" +
  "v4_core = drawLight(xPos, materialInput.st, coresize, coresize*2.0, widthoffset*2.0);\n" +
  "m.diffuse = color.xyz + v4_core.xyz*v4_core.w*0.8; \n" +
  "m.alpha = pow(v4_color.w, 3.0); \n" +
  "return m; \n" +
  "} \n";

export const FlyLine = (
  viewer,
  positions,
  height,

) => {
  let scene = viewer.scene;
  const positions2 = setPathData(positions[0], positions[1], height)
  let length = positions2.length
  const colors = []
  for (let i = 0; i < length; ++i) {
    let alpha = 0;
    if (i < length / 2) {
      alpha = (i / length) * 2 * 0.6 + 0.2;
    } else {
      alpha = ((length - i) / length) * 2 * 0.6 + 0.2;
    }
    colors.push(
      Cesium.Color.fromRandom({
        red: 0.0,
        green: 1.0,
        blue: 0.0,
        alpha: alpha,
      }),
    );
  }
  // 添加飞线轨道
  viewer.scene.primitives.add(
    new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({
          positions: positions2,
          width: 2.0,
          vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
          colors: colors,
          colorsPerVertex: true,
        }),
      }),
      appearance: new Cesium.PolylineColorAppearance(),
    })
  );
  let FlowingLineMaterial = new Cesium.Material({
    fabric: {
      type: 'FlowingLineMaterial',
      uniforms: {
        color: new Cesium.Color(0.0, 1.0, 1.0, 1.0), // light color
        speed: 1.5, // flowing speed, speed > 0.0
        headsize: 0.05, // 0.0 < headsize < 1.0
        tailsize: 0.5, // 0.0 < tailsize < 1.0
        widthoffset: 0.1, // 0.0 < widthoffset < 1.0
        coresize: 0.05, // 0.0 < coresize < 1.0
      },
      source: FlowingLineMaterialGLSL,
    },
  });

  let primitive = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.PolylineGeometry({
        positions: positions2,
        width: 20.0,
        vertexFormat: Cesium.VertexFormat.ALL,
      }),
    }),
    appearance: new Cesium.PolylineMaterialAppearance({
      material: FlowingLineMaterial,
    }),
  });

  scene.primitives.add(primitive);
};