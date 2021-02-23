import React from 'react';
import HelloWorld from '../components/HelloWorld/HelloWorld.jsx';
import ImageMark from '../components/ImageMark/ImageMark.jsx';

class Index extends React.Component {
    state = {
        title: "This is a base react project."
    };

    render() {
        const { title } = this.state;
        return (
            <div>
                <h2>{title}</h2>
                <HelloWorld />
                <div style={{ position: "absolute", left: "20px", bottom: "20px", width: "900px", height: "900px", backgroundColor: "#e0e0e0" }}>
                    <ImageMark
                        url={'https://dpic.tiankong.com/3g/wg/QJ6113194984.jpg?x-oss-process=style/show_794s'}
                        lineColor="#ff0000"
                        lineWidth={2}
                        onMarked={({ top, left, width, height }) => {
                            console.log({ top, left, width, height })
                        }}
                    />
                </div>
            </div>
        )
    }
}

export default Index;