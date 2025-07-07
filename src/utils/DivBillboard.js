import * as Cesium from "cesium"
/* eslint-disable */
import { Cartesian3, Cartesian2, Viewer, SceneTransforms } from "cesium";
import { createApp, h } from "vue";
import analysisDiv from "@/components/Billboard/analysisDiv.vue"
import borderDiv from "@/components/Billboard/borderDiv.vue"
import lineDiv from "@/components/Billboard/lineDiv.vue"
/**
 * 实现自己想要的样式弹框

 */
class DivBillboard {
    viewer;
    position;
    content;
    id;
    element;
    maxRenderDis = 500000;
    show;
    vueComponent;
    enableMouse;

    /**
     * 
     * @param viewer Viewer
     * @param position Cartesian3
     * @param content string HTMLElement的string
     * @param vueComponent vue组件
     * @param enableMouse 是否允许鼠标事件
     */
    constructor(viewer, position, content, vueComponent, enableMouse) {
        this.viewer = viewer;
        this.position = position;
        this.content = content;
        this.vueComponent = vueComponent;
        this.enableMouse = enableMouse || false
        this.maxRenderDis =
            Math.round(viewer.camera.positionCartographic.height) * 5;
        this.id = new Date().getTime().toString();
        this.show = true;
        this.initBillboard();
    }

    initBillboard() {
        this.element = document.createElement("div");
        this.element.style.position = "absolute";
        if (this.enableMouse) {
            this.element.style.pointerEvents = "auto";
        } else {
            this.element.style.pointerEvents = "none";
        }
        // 创建 Vue 应用实例并挂载到这个 DOM 元素上
        const app = createApp({
            render: () => h(this.vueComponent, { id: this.id, htmlContent: this.content })
        });
        app.mount(this.element);
        this.viewer.cesiumWidget.container.appendChild(this.element);
        //实时更新位置
        this.viewer.scene.postRender.addEventListener(
            this.updateBillboardLocation,
            this
        );
    }
    updateBillboardLocation() {
        if (this.element) {
            const canvasHeight = this.viewer.scene.canvas.height;
            // const windowPosition = new Cartesian2();
            // SceneTransforms.wgs84ToWindowCoordinates(
            //     this.viewer.scene,
            //     this.position,
            //     windowPosition
            // );
            const windowPosition = Cesium.SceneTransforms.worldToWindowCoordinates(this.viewer.scene, this.position)
            this.element.style.bottom = canvasHeight - windowPosition.y + "px";
            const elWidth = this.element.offsetWidth;
            this.element.style.left = windowPosition.x - elWidth / 2 + "px";
            this.element.style.transformStyle = 'preserve-3d';


            const camerPosition = this.viewer.camera.position;
            let height =
                this.viewer.scene.globe.ellipsoid.cartesianToCartographic(
                    camerPosition
                ).height;
            height += this.viewer.scene.globe.ellipsoid.maximumRadius;
            if (this.show) {
                if (
                    !(Cartesian3.distance(camerPosition, this.position) > height) &&
                    this.viewer.camera.positionCartographic.height < this.maxRenderDis
                ) {
                    this.element.style.display = "block";
                    let scale = this.maxRenderDis / (Cartesian3.distance(camerPosition, this.position) * 5);
                    if(scale > 1){
                        scale = 1
                    }
                    this.element.style.transform = `scale(${scale})`;

                } else {
                    this.element.style.display = "none";
                }
            } else {
                this.element.style.display = "none";
            }
        }
    }
    setContent(content) {
        this.content = content;
        if (this.element) {
            const app = createApp({
                render: () => h(this.vueComponent, { id: this.id, htmlContent: this.content })
            });
            app.mount(this.element); // 重新渲染组件
        }
    }
    destroy() {
        if (this.element) {
            this.viewer.scene.postRender.removeEventListener(this.updateBillboardLocation.bind(this));
            this.viewer.cesiumWidget.container.removeChild(this.element);
            this.element = null;
        }
    }
}

/**
 * 
 * @param {*} viewer 
 * @param {*} coordinate 经纬度，高度
 * @param {*} type 弹框类型 1，2，3
 * @returns 弹框实例，可以用来销毁 destroy()，或者重新设置内容 setContent()
 */
const addDiv = (viewer, coordinate, type) => {
    let component;
    if (type === 1) {
        component = analysisDiv
    } else if (type === 2) {
        component = borderDiv
    } else if (type === 3) {
        component = lineDiv
    }
    let pos = Cesium.Cartesian3.fromDegrees(coordinate.longitude, coordinate.latitude, coordinate.height);
    let content = `经度：${coordinate.longitude}\n纬度：${coordinate.latitude}\n高度：${coordinate.height}`
    return new DivBillboard(viewer, pos, content, component);
    // console.log(billboard)
    // addpoint(coordinate.longitude, coordinate.latitude)
}
export default addDiv;