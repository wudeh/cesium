import * as Cesium from "cesium";
import icon from "../assets/images/building.png";
import { max } from "lodash-es";

export default function setBillboard(viewer, degree = []) {
    const billboardsCollection = viewer.scene.primitives.add(
        new Cesium.BillboardCollection()
    );
    // 带图片的点
    billboardsCollection._id = `mark_rail`;
    for (let i = 0; i < degree.length; i++) {
      const feature = degree[i];
      // 每个点位的坐标
      const coordinates = feature.coordinates;
      // 将坐标处理成3D笛卡尔点
      const position = Cesium.Cartesian3.fromDegrees(
        coordinates[0],
        coordinates[1],
        1000
      );
      const name = feature.name;
      
      // add的是Billboard，将一个个Billboard添加到集合当中
      billboardsCollection.add({
        image: icon,
        width: 32,
        height: 32,
        position,
        id: 'mark_' + name,
        maximumScale: 10000, // 最大缩放比例
      });
    }
    return billboardsCollection;
}