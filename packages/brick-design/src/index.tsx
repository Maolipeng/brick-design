import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './style.less';
import { clearHovered, LEGO_BRIDGE, LegoProvider, useSelector } from 'brickd-core';
import ReactDOM from 'react-dom';
import Container from './warppers/Container';
import NoneContainer from './warppers/NoneContainer';
import { iframeSrcDoc } from './utils';
import { onDragover, onDrop } from './common/events';

export * from './common/events'


const onIframeLoad = () => {
    const head = document.head.cloneNode(true)
    const iframe: any = document.getElementById('dnd-iframe');
    const iframeDocument = iframe.contentDocument
    iframeDocument.head.remove()
    iframeDocument.documentElement.insertBefore(head, iframeDocument.body)
}

/**
 * 鼠标离开设计区域清除hover状态
 */
interface BrickDesignProps {
    onLoadEnd?: () => void
}

const stateSelector = ['componentConfigs', 'platformInfo']

export function BrickDesign(props: BrickDesignProps) {
    const {componentConfigs, platformInfo} = useSelector(stateSelector);
    const [spinShow, setSpinShow] = useState(true);
    let designPage: any = useMemo(() => {
        if (!componentConfigs.root) return null
        const {root: {componentName}} = componentConfigs;
        const props = {
            specialProps: {
                domTreeKeys: ['root'],
                key: "root"
            }
        }
        return LEGO_BRIDGE.containers!.includes(componentName) ? <Container {...props} /> : <NoneContainer {...props}/>
    }, [componentConfigs]);

    const divContainer = useRef(null);

    useEffect(() => {
        const iframe: any = document.getElementById('dnd-iframe');
        iframe.contentWindow.addEventListener('dragover', onDragover);
        iframe.contentWindow.addEventListener('drop', onDrop);
        if (!spinShow) {
            divContainer.current = iframe.contentDocument.getElementById('dnd-container');
            ReactDOM.render(
                <LegoProvider>
                    {designPage}
                </LegoProvider>, divContainer.current);
        }
        return () => {
            iframe.contentWindow.removeEventListener('dragover', onDragover);
            iframe.contentWindow.removeEventListener('drop', onDrop);
        };

    }, [spinShow]);

    useEffect(() => {
        if (divContainer.current)
            ReactDOM.render(
                <LegoProvider>
                    {designPage}
                </LegoProvider>, divContainer.current);
    }, [divContainer.current, designPage]);


    const {size} = platformInfo;

    const style = {width: size[0], maxHeight: size[1], transition: 'all 700ms'};

    const {onLoadEnd} = props
    return (
        <div style={style}
             className={`${styles['browser-mockup']} ${styles['with-url']}`}
        >
            <iframe onMouseLeave={clearHovered}
                    id="dnd-iframe"
                    className={styles['dnd-container']}
                    srcDoc={iframeSrcDoc}
                    onLoad={useCallback(() => {
                        onIframeLoad()
                        onLoadEnd && onLoadEnd()
                        setSpinShow(false)
                    }, [])}
            />
        </div>
    );
}
