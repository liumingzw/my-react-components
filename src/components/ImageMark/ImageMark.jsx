import React from 'react';

/**
 * 在图片上，使用鼠标标注一块矩形区域，返回top-left，right-bottom坐标（以图片左上角为原点，单位是像素）
 * canvas doc: https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API
 * props(all required): url, lineColor, lineWidth, onMarked({ top, left, width, height })
 */
class ImageMark extends React.Component {
    canvasImgRef = React.createRef();
    canvasRectangleRef = React.createRef();

    parentWidth = 0;
    parentHeight = 0;

    isMarking = false; //is marking rectangle
    scaleFactor = 1; //缩放因子：原始图片需要缩放，适配parent dom element
    mouseDownPoint = { x: 0, y: 0 };

    state = {
        canvasWidth: 300,
        canvasHeight: 300,
        canvasStyle: { position: "absolute", marginTop: 0, marginLeft: 0 }
    };

    /**
     * 1. webgl support check
     * 2. load img; after loaded
     * 3. get parent size, img size; compute scale factor
     * 4. update state: canvas size, canvas style
     * 5. after updated: draw img
     */
    componentDidMount() {
        if (!this.canvasImgRef.current.getContext) {
            console.error("Not support webgl");
            return;
        }

        const { url, lineColor, lineWidth } = this.props;

        const img = new Image();
        img.src = url;
        img.onload = () => {
            const { naturalWidth, naturalHeight } = img;
            this.parentWidth = this.canvasRectangleRef.current.parentElement.clientWidth;
            this.parentHeight = this.canvasRectangleRef.current.parentElement.clientHeight;
            this.scaleFactor = Math.min(this.parentWidth / naturalWidth, this.parentHeight / naturalHeight);
            const canvasWidth = naturalWidth * this.scaleFactor;
            const canvasHeight = naturalHeight * this.scaleFactor;
            const marginLeft = (this.parentWidth - canvasWidth) / 2;
            const marginTop = (this.parentHeight - canvasHeight) / 2;

            this.setState({
                canvasWidth,
                canvasHeight,
                canvasStyle: { ...this.state.canvasStyle, marginTop, marginLeft }
            }, () => {
                this.canvasRectangleRef.current.getContext("2d").strokeStyle = lineColor;
                this.canvasRectangleRef.current.getContext("2d").lineWidth = lineWidth;
                this.canvasImgRef.current.getContext("2d").drawImage(img, 0, 0, canvasWidth, canvasHeight);
                this.canvasRectangleRef.current.addEventListener('mousedown', this.onMouseDown);
                this.canvasRectangleRef.current.addEventListener('mousemove', this.onMouseMove);
                this.canvasRectangleRef.current.addEventListener('mouseup', this.onMouseUp);
            });
        };
    }

    componentWillUnmount() {
        this.canvasRectangleRef.current.removeEventListener('mousedown', this.onMouseDown);
        this.canvasRectangleRef.current.removeEventListener('mousemove', this.onMouseMove);
        this.canvasRectangleRef.current.removeEventListener('mouseup', this.onMouseUp);
    }

    onMouseDown = (event) => {
        // left button
        if (event.button === 0) {
            this.clearCanvasRectangle();
            this.isMarking = true;
            this.mouseDownPoint = { x: event.offsetX, y: event.offsetY };
        }
    };

    onMouseMove = (event) => {
        if (!this.isMarking) {
            return;
        }
        // draw rectangle
        this.clearCanvasRectangle();
        const { x, y } = this.mouseDownPoint;
        const w = event.offsetX - x;
        const h = event.offsetY - y;
        this.canvasRectangleRef.current.getContext("2d").strokeRect(x, y, w, h);
    };

    onMouseUp = (event) => {
        if (!this.isMarking) {
            return;
        }
        this.isMarking = false;
        const top = Math.min(this.mouseDownPoint.y, event.offsetY) / this.scaleFactor;
        const left = Math.min(this.mouseDownPoint.x, event.offsetX) / this.scaleFactor;
        const width = Math.abs(this.mouseDownPoint.x - event.offsetX) / this.scaleFactor;
        const height = Math.abs(this.mouseDownPoint.y - event.offsetY) / this.scaleFactor;
        this.props.onMarked({ top, left, width, height });
    };

    clearCanvasRectangle = () => {
        const { canvasWidth, canvasHeight } = this.state;
        this.canvasRectangleRef.current.getContext("2d").clearRect(0, 0, canvasWidth, canvasHeight);
    };

    render() {
        const { canvasWidth, canvasHeight, canvasStyle } = this.state;
        return (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <canvas
                    ref={this.canvasImgRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    style={canvasStyle} />
                <canvas
                    ref={this.canvasRectangleRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    style={canvasStyle} />
            </div>
        )
    }
}

export default ImageMark;
