import React from 'react';
import './App.css';
import MicRecorder from 'mic-recorder-to-mp3';
import Dropzone from 'react-dropzone';
import { Icon } from 'watson-react-components';
import axios from 'axios';
import * as env from './constants'

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isRecording: false,
      blobURL: '',
      googleText: '',
      spinxText: '',
      azureText: '',
      deepText: '',
      ibmText: '',
      houndifyText: ''
    };
  }

  

  record = () => {
    if(!this.state.isRecording){
      this.reset();
      Mp3Recorder.start().then(() => {
        this.setState({ isRecording: true });
      }).catch((e) => {
        console.error(e);
      });
    }
    else{
      Mp3Recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        this.getBase64(blob);
        const blobURL = URL.createObjectURL(blob)
        this.setState({ blobURL, isRecording: false });
      }).catch((e) => console.log(e));
    }
    
  };

  reset(){
    this.setState({
      googleText: '',
      spinxText: '',
      azureText: '',
      deepText: '',
      ibmText: '',
      houndifyText: ''
    })
  }

  getBase64(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      console.log(reader.result);
      const formData = new FormData();
      formData.append('file', reader.result)
      this.uploadRecording('google',formData);
      this.uploadRecording('sphinx',formData);
      this.uploadRecording('azure',formData);
      this.uploadRecording('deepspeech',formData);
      this.uploadRecording('ibm',formData);
      this.uploadRecording('houndify',formData);


    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
 }



  onDrop = (files) => {
    this.reset();
    const file = files[0];
    if (!file) {
      return;
    }
    this.getBase64(file);
  }

  uploadRecording(serviceName,formData){
    axios({
      method: 'post',
      url: env.url + serviceName,
      data: formData,
      headers: {'Content-Type': 'multipart/form-data' }
      })
      .then(function (response) {
          //handle success
          console.log(response);
          switch(serviceName) {
            case 'google':
              this.setState({ googleText : response.data})
              break;
            case 'sphinx':
              this.setState({ spinxText : response.data})
              break;
            case 'azure':
              this.setState({ azureText : response.data})
              break;
            case 'deepspeech':
              this.setState({ deepText : response.data})
              break;
            case 'ibm':
              this.setState({ ibmText : response.data})
              break;
            case 'houndify':
              this.setState({ houndifyText : response.data})
              break;
            default:
              console.log('default');
          }
      })
      .catch(function (response) {
          //handle error
          console.log(response);
      });

  }

  render(){
    return (
      <div className="App">
        <div className="headerPane">
          <Icon style={{height:'40px'}} type='play' fill='#FFFFFF' /><span className="headerSpan">Speech Recognizer</span>
          <span style={{float:'right',marginRight:'50px',color:'white',fontSize:'20px',position:'relative',top:'6px'}}><span style={{marginRight:'30px',color:'#ef6c00'}}>Home</span>
          <span>About</span></span>
        </div>

        <div className="flexBox">
          <div>
            <button onClick={this.record} className="recordButton"><Icon type='microphone' fill='#FFFFFF' style={{height:'30px'}} /> <span className="recordText">{this.state.isRecording ? 'Stop Recording' : 'Record Audio'}</span></button>
          </div>
          <div>
            <Dropzone 
            onDrop={this.onDrop} maxSize={200 * 1024 * 1024}
            accept="audio/wav, audio/mp3, audio/mpeg, audio/l16, audio/ogg, audio/flac, .mp3, .mpeg, .wav, .ogg, .opus, .flac">
            {({getRootProps, getInputProps}) => (
              <div {...getRootProps()} className="uploadButton">
                <input {...getInputProps()} />
                <Icon type='upload' fill='#FFFFFF' style={{height:'30px'}} /><span style={{position:'relative',top:'12px',paddingLeft:'10px'}}>Upload Audio File</span>
              </div>
            )}
          </Dropzone>
          </div>

        </div>

        <div className="textPanel">
          <div className="flexCard">
            <div className="section">Google</div>
            <div className="message">{this.state.googleText}</div>
          </div>

          <div className="flexCard">
            <div className="section">Sphinx</div>
            <div className="message">{this.state.spinxText}</div>
          </div>

          <div className="flexCard">
            <div className="section">Azure</div>
            <div className="message">{this.state.azureText}</div>
          </div>
        </div>

        <div className="textPanel" style={{marginBottom:'20px'}}>
          <div className="flexCard">
            <div className="section">Deep Speech</div>
            <div className="message">{this.state.deepText}</div>
          </div>

          <div className="flexCard">
            <div className="section">IBM Watson</div>
            <div className="message">{this.state.ibmText}</div>
          </div>

          <div className="flexCard">
            <div className="section">Houndify</div>
            <div className="message">{this.state.houndifyText}</div>
          </div>
        </div>
          
          
          {/* <audio src={this.state.blobURL} controls="controls" /> */}
      </div>
    );
  }
}

export default App;
