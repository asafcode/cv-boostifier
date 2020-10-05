import './JurassicUnix.scss';

import React, {PropsWithChildren} from 'react';
import {IProfileProps} from '../../models';
import {THEME_DEPRESSING} from './JurassicUnix.config';
import {BOX_MARGIN, HUE_INCREMENT, SCENE_WIDTH, SIZE_UNIT} from './JurassicUnix.constants';
import {BoxProps} from './types/box-props';
import {getPerspectiveFor, isBrowserFirefox, addPositions, get3DTranslation} from './JurassicUnix.helpers';

export function JurassicUnix(props: PropsWithChildren<IProfileProps>) {
    const {basics, skills, work, education, references, projects, publications, languages} = props.profile;

    const SELECTED_THEME = THEME_DEPRESSING;
    const DEFAULT_PERSPECTIVE = getPerspectiveFor(
        0,
        0,
        SCENE_WIDTH,
        SCENE_WIDTH
    );
    
    // TODO (msuber): add mapping helper
    const BOX_STRUCTURE: BoxProps[] = [
        { id: "box0" },
        {
            id: "box1",
            children: [
                {
                    id: "box10",
                    children: [
                        {
                            id: "box100",
                            children: [
                                {
                                    id: "box1000",
                                    children: [
                                        { id: "box10000", children: [{ id: "box100000" }] },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            id: "box2",
            children: [
                { id: "box20" },
                {
                    id: "box21",
                    children: [
                        { id: "box210" },
                        { id: "box211" },
                        { id: "box212" },
                        { id: "box213" },
                        { id: "box214" },
                    ],
                },
            ],
        },
        { id: "box3" },
        { id: "box4" },
        { id: "box5" },
        { id: "box6" },
        { id: "box7" },
        { id: "box8" },
        { id: "box9" },
    ];

    // TODO (jgosar): add props types and state
    class SceneContainer extends React.Component<any> {
        constructor(props: any) {
            super(props);
            this.state = {
                perspective: { ...DEFAULT_PERSPECTIVE },
                focusedBoxId: undefined,
            };
            this.handleClick = this.handleClick.bind(this);
        }

        handleClick(boxProps: any, e: any) {
            e.preventDefault();
            e.stopPropagation();
            if (
                (this.state as any).focusedBoxId === undefined ||
                (this.state as any).focusedBoxId !== boxProps.id
            ) {
                // Focus on the clicked box
                const newState = {
                    perspective: getPerspectiveFor(
                        boxProps.absolutePosition.x,
                        boxProps.absolutePosition.y,
                        boxProps.absolutePosition.z + boxProps.width,
                        boxProps.width
                    ),
                    focusedBoxId: boxProps.id,
                };
                this.setState(newState)
            } else {
                // The clicked box was already focused, zoom out to wide view
                const newState = {
                    perspective: { ...DEFAULT_PERSPECTIVE },
                    focusedBoxId: undefined,
                };
                this.setState(newState)
            }
        }

        render() {
            const themeClass = SELECTED_THEME.name;
            return (
                <div className={"jurassic-unix__wrapper " + themeClass}>
                    <div className="jurassic-unix__three-d-container jurassic-unix__translated-to-screen-centre">
                        <PositionedContainer
                            position={(this.state as any).perspective}
                            animated={!isBrowserFirefox()}
                        >
                            <Box
                                position={{ x: 0, y: 0, z: 0 }}
                                absolutePosition={{ x: 0, y: 0, z: 0 }}
                                width={SCENE_WIDTH}
                                height={SCENE_WIDTH / 5}
                                hue={SELECTED_THEME.baseHue}
                                id={"base"}
                                key={"base"}
                                onClick={this.handleClick}
                            >
                                <BoxDataGroup
                                    data={BOX_STRUCTURE}
                                    groupWidth={SCENE_WIDTH}
                                    hue={SELECTED_THEME.baseHue + SELECTED_THEME.hueIncrement}
                                    onClick={this.handleClick}
                                />
                            </Box>
                        </PositionedContainer>
                    </div>
                </div>
            );
        }
    }

    // TODO (jgosar): add props types
    class BoxDataGroup extends React.Component<any> {
        private boxes: JSX.Element[];
        private boxCount: number;
        private boxesInWidth: number;
        private boxSpace: number;
        private boxWidth: number;
        private boxHeight: number;

        constructor(props: any) {
            super(props);
            
            this.boxes = [];
            this.boxCount = (this.props as any).data.length;
            this.boxesInWidth = Math.ceil(Math.sqrt(this.boxCount));
            this.boxSpace = (this.props as any).groupWidth / this.boxesInWidth;
            this.boxWidth = (1 - 2 * BOX_MARGIN) * this.boxSpace;
            this.boxHeight = this.boxWidth / 5;
        }

        render() {
            (this.props as any).data.forEach((box: BoxProps, index: number) => {
                const xPos = index % this.boxesInWidth;
                const zPos = Math.floor(index / this.boxesInWidth);
    
                const boxPosition = {
                    x: (xPos + BOX_MARGIN) * this.boxSpace,
                    y: 0 - this.boxHeight,
                    z: (zPos + BOX_MARGIN) * this.boxSpace,
                };
    
                const boxAbsolutePosition = addPositions(
                    boxPosition,
                    (this.props as any).absolutePosition
                );
    
                const childGroup = box.children ? (
                    <BoxDataGroup
                        absolutePosition={boxAbsolutePosition}
                        data={box.children}
                        groupWidth={this.boxWidth}
                        hue={(this.props as any).hue + HUE_INCREMENT}
                        onClick={(this.props as any).onClick}
                    />
                ) : undefined;
    
                this.boxes.push(
                    <Box
                        position={boxPosition}
                        absolutePosition={boxAbsolutePosition}
                        width={this.boxWidth}
                        height={this.boxHeight}
                        hue={(this.props as any).hue}
                        id={box.id}
                        key={box.id}
                        onClick={(this.props as any).onClick}
                    >
                        {childGroup}
                    </Box>
                );
            });
    
            return <>{this.boxes}</>;
        }
    }

    // TODO (jgosar): add props types
    class Box extends React.Component<any> {
        constructor(props: any) {
            super(props);
        }

        render() {
            return (
                <PositionedContainer position={(this.props as any).position}>
                    <div
                        className="jurassic-unix__box"
                        onClick={(e) => (this.props as any).onClick(this.props, e as any)}
                        style={{
                            "--box-length": (this.props as any).width + SIZE_UNIT,
                            "--box-width": (this.props as any).width + SIZE_UNIT,
                            "--box-height": (this.props as any).height + SIZE_UNIT,
                            "--hue": (this.props as any).hue,
                        } as any}
                    >
                        {(this.props as any).children}
                        <div className="jurassic-unix__box-side jurassic-unix__box-top"></div>
                        <div className="jurassic-unix__box-side jurassic-unix__box-back"></div>
                        <div className="jurassic-unix__box-side jurassic-unix__box-front"></div>
                        <div className="jurassic-unix__box-side jurassic-unix__box-right"></div>
                        <div className="jurassic-unix__box-side jurassic-unix__box-left"></div>
                        <div className="jurassic-unix__box-side jurassic-unix__box-bottom"></div>
                        <div className="jurassic-unix__box-label">{(this.props as any).id}</div>
                    </div>
                </PositionedContainer>
            );   
        }
    }

    // TODO (jgosar): add props types
    class PositionedContainer extends React.Component<any> {
        private className: string;

        constructor(props: any) {
            super(props);
            this.className = "jurassic-unix__three-d-container" + ((this.props as any).animated ? " jurassic-unix__animated" : "");
        }

        render() {
            return (
                <div
                    className={this.className}
                    style={{
                        transform: get3DTranslation((this.props as any).position),
                    }}
                >{(this.props as any).children}</div>
            );
        }
    }

    return (
        <SceneContainer />
    );
}
