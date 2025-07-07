import * as Cesium from "cesium";
import icon from "../assets/images/building.png";
import icon2 from "../assets/images/rail.png";

// 据说可以高性能实现 10w 个聚合点
export default function formatClusterPoint(viewer, features) {
    const billboardsCollection = viewer.scene.primitives.add(
        new Cesium.BillboardCollection()
    );
    let billboardsCollectionCombine = new Cesium.BillboardCollection();

    let primitivesCollection = null;
    let primitives = null;
    primitivesCollection = new Cesium.PrimitiveCollection();
    billboardsCollectionCombine = new Cesium.BillboardCollection();
    var scene = viewer.scene;
    let primitivecluster = null;
    primitivecluster = new Cesium.PrimitiveCluster();

    //与entitycluster相同设置其是否聚合 以及最大最小值
    primitivecluster.enabled = true;
    primitivecluster.pixelRange = 60;
    primitivecluster.minimumClusterSize = 2;

    //后面设置聚合的距离及聚合后的图标颜色显示与官方案例一样
    for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        const coordinates = feature.coordinates;
        const position = Cesium.Cartesian3.fromDegrees(
            coordinates[0],
            coordinates[1],
            2000
        );

        // 带图片的点
        billboardsCollectionCombine.add({
            image: icon,
            width: 32,
            height: 32,
            position,
        });
    }
    primitivecluster._billboardCollection = billboardsCollectionCombine;
    // 同时在赋值时调用_initialize方法
    primitivecluster._initialize(scene);

    primitivesCollection.add(primitivecluster);
    primitives = viewer.scene.primitives.add(primitivesCollection);

    primitivecluster.clusterEvent.addEventListener(
        (clusteredEntities, cluster) => {
            // 关闭自带的显示聚合数量的标签
            cluster.label.show = false;
            cluster.billboard.show = true;
            cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

            // 根据聚合数量的多少设置不同层级的图片以及大小
            cluster.billboard.image = combineIconAndLabel(
                icon2,
                clusteredEntities.length,
                64
            );
            // cluster.billboard.image = "/images/school-icon.png";
            cluster.billboard._imageHeight = 60;
            cluster.billboard._imageWidth = 60;
            cluster.billboard._dirty = false;
            cluster.billboard.width = 40;
            cluster.billboard.height = 40;
        }
    );
    return primitivecluster;
    };
