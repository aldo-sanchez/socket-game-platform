import React from "react";
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Scoreboard from './partials/Scoreboard';
import Pinata from './partials/Pinata';
import QRCode from 'qrcode-react';
// ---Styling--
import Styles from './styles/customStyles.js';
import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import SvgIcon from 'material-ui/SvgIcon';
import Dialog from 'material-ui/Dialog';
import Drawer from 'material-ui/Drawer';
import CommunicationChatBubble from 'material-ui/svg-icons/communication/chat-bubble';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';

import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';

const appendScript = (scriptArray, selector) => {
    scriptArray.map(scriptPath => {
        const script = document.createElement('script');
        script.src = scriptPath;
        try { document.querySelector(selector).appendChild(script);
        } catch (e) { }
    });
}

function DataPackage(globalData, playerSelection, dataType = null, data = null) {
    this.roomId = globalData.gameId;
    this.data = data;
    this.playerId = globalData.playerId;
    this.playerSelection = playerSelection;
    this.dataType = dataType;
    this.timestamp = Date.now();
}

const inputEventHandler = (DataPackage) => {
    const a_y = DataPackage.data.acc.y;
    const a_x = DataPackage.data.acc.x;
    const mag  = Math.sqrt(Math.pow(a_y, 2) + Math.pow(a_x, 2));
    const alpha = Math.atan(a_x/(a_y))*( 180 / Math.PI);
    if (DataPackage.playerSelection == 0) {
        updateSpring(mag, alpha)
    } else if (DataPackage.playerSelection == 1) {
        drawBat(mag);
    } else console.log('Nope');
}

export default class Lobby extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chatInput: null,
            messages: [],
            score: {
                player1: 0,
                player2: 0
            },
            acceleration: {
                x: 0,
                y: 0,
                z: 0
            },
            modalIsOpen: false,
            drawerOpen: false
        };

    this.handleChatInput = this.handleChatInput.bind(this);
    this.addChatMessage = this.addChatMessage.bind(this);
    this.displayChatMessages = this.displayChatMessages.bind(this);
    this.sendChatMessage = this.sendChatMessage.bind(this);
    this.sendSocketInput = this.sendSocketInput.bind(this);

    // --modals--
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    // --drawer--
    this.handleToggle = this.handleToggle.bind(this);
    this.handleDrawerClose = this.handleDrawerClose.bind(this);
    }


    componentWillUnmount() {
        document.querySelector('#canvas').classList.add("hide");
        this.props.setMainState({
            gameId: undefined,
            playerSelection: undefined
        });
    }

    componentWillMount() {
        console.log('Game', this.props);
        // Redirect users away from page if not logged in or no gameId
        //!this.props.globalData.gameId ||
        if (!this.props.globalData.playerId) {
            window.location.pathname = "/";
        }
    }

    componentDidMount() {
        // this.setState({playerSelection: sessionStorage.getItem('player-selection')});
        document.querySelector('#canvas').classList.remove("hide");
        this.props.socket.emit('room',
            new DataPackage(this.props.globalData, this.state.playerSelection)
        );

        this.props.socket.on('connection-status', this.addChatMessage);
        this.props.socket.on('chat-message', this.addChatMessage);
        this.props.socket.on('input', inputEventHandler);
    }

    // onKeyPress(e){
    //     if (this.state.playerSelection == 1 || this.state.playerSelection == 2) {
    //         const acceptedKeys = [119, 97, 115, 100, 32];

    //         if (acceptedKeys.indexOf(e.charCode) !== -1) {
    //             e.preventDefault();
    //             this.props.socket.emit('input',
    //                 new DataPackage(
    //                     this.props.globalData,
    //                     this.state.playerSelection,
    //                 )
    //             );
    //         }
    //     }
    // }


    addChatMessage(message) {
        let chatArray = this.state.messages;
        chatArray.push(message)
        this.setState({messages: chatArray});
    }


    sendChatMessage(e) {
        e.preventDefault();
        if (this.state.chatInput.length > 0) {
        this.props.socket.emit(
            'chat-message',
            new DataPackage(this.props.globalData, this.state.playerSelection, this.state.chatInput)
        );
        // this.setState({chatInput: ""});
        document.getElementById('message-input').value = "";

        }
    }

    handleChatInput(event) {
        this.setState({chatInput: event.target.value});
    }

    displayChatMessages() {
        return this.state.messages
        .map((message, i) => {
            return (
              <ListItem
                key={i}
                >
                {message}
              </ListItem>
            )
        });
    }

    sendSocketInput(x,y) {
        const data = {
        acc: {
                x: x,
                y: y
            }
        }
        this.props.socket.emit('input',
            new DataPackage(
                this.props.globalData,
                this.props.globalData.playerSelection,
                'acceleration',
                data
            )
        );
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }
    closeModal() {
        this.setState({modalIsOpen:false});
    }

    handleToggle () { this.setState({drawerOpen: !this.state.drawerOpen});}

    handleDrawerClose() { this.setState({drawerOpen: false});}

    render() {

        return (
            <div className="container game-wrapper">
                <div className="row">
                    { /* --player header: Left corner-- */}
                    <div className="col s6 playerHeader valign-wrapper">
                        <img style={{float:"left"}} className="circle responsive-img" src="/img/bird-sm.png" />
                        <h4>{this.props.globalData.playerName}</h4>
                    </div>
                    { /* --player header: Right corner-- */}
                    <div className="col s6 playerHeader valign-wrapper">
                        <img style={{float:"right", right:0, position:"relative", width:"45px"}} className="circle responsive-img" src="/img/arm125.png" />
                        <h4 style={{float:"right"}}>{this.props.globalData.playerName}</h4>
                    </div>
                </div>
                
                {/* --- Drawer & Drawer Button ---*/}
                <div className="row">
                    <div className="col s1">
                        <Paper style={{display: "block", marginLeft:"auto", marginRight:"auto", width:70, height:70}} zDepth={2} circle={true}>
                            <IconButton
                                tooltip="Chat"
                                tooltipPosition="top-center"
                                iconStyle={{width:45, height:45}}
                                onClick={this.handleToggle}
                                >
                                <CommunicationChatBubble />
                            </IconButton>
                        </Paper>
                        
                        { /* ---- Drawer / Chat Messages---- */}
                        <Drawer 
                            open={this.state.drawerOpen}
                            docked={false}
                            width={350}
                            onRequestChange={(open) => this.setState({open})}
                            >
                            <FlatButton 
                                label="Close"
                                style={{float:"right"}}
                                onClick={this.handleDrawerClose}
                                />
                                <div className="row">
                                <div className="chat-wrapper col s12">
                                    <Card>
                                        <CardHeader
                                            title="Chat Messages"
                                        />
                                        <List id="messages" className="list-unstyled" style={{paddingLeft:"10px", paddingRight:"10px"}}>
                                                <form onSubmit={this.sendChatMessage}>
                                                <TextField
                                                    id="message-input"
                                                    hintText="Send a Message"
                                                    multiLine={true}
                                                    rows={2}
                                                    onChange={this.handleChatInput}
                                                />
                                                <RaisedButton
                                                    fullWidth={true}
                                                    label="Send"
                                                    primary={true}
                                                    containerElement={
                                                        <button id="message-button" type="submit"></button>
                                                    }
                                                    />
                                                </form>
                                            {this.displayChatMessages()}
                                        </List>
                                    </Card>
                                </div>
                            </div>
                        </Drawer>
                    </div>
                </div>
                {/* ------ Connect Device ------*/}
                {/* ---- qr code ----*/}
                <div className="row">
                    <div className="col s1">
                        {/*Modal button*/}
                        <Paper style={{display: "block", marginLeft:"auto", marginRight:"auto", width:70, height:70}} zDepth={2} circle={true}>
                            <IconButton
                                tooltip="QR Code"
                                tooltipPosition="top-center"
                                className="iconBtn"
                                onClick={this.openModal}
                                >
                                <img  src='img/qr-code-icon.png' />
                            </IconButton>
                        </Paper>
                        {/* ---QR Code Modal---*/}
                        <Dialog
                          style={{zIndex:10000, width:"260px"}}
                          title="QR Code"
                          modal={false}
                          actions={
                              <FlatButton
                                label="Close"
                                primary={true}
                                onClick={this.closeModal}
                              />}
                          open={this.state.modalIsOpen}
                          onRequestClose={this.closeModal}
                        >
                          <QRCode className="QRcanvas" value={`${window.location.origin}/control_device/${this.props.globalData.gameId}/${this.props.globalData.playerId}/${this.state.playerSelection}`} />
                        </Dialog>
                        {/* 
                        <a target="_blank"
                            href={`/control-device/${this.props.globalData.gameId}/${this.props.globalData.playerId}/${this.props.globalData.playerSelection}`}>go here to connect control device: <br/>
                            {`/control-device/${this.props.globalData.gameId}/${this.props.globalData.playerId}/${this.props.globalData.playerSelection}`}
                        </a>
                        */}
                    </div>
                </div>
                    <div id="script-container">
                    </div>

            </div>
        );
    }
}
