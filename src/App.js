import React from 'react';
import './App.css';
import Dropzone from 'react-dropzone';
import { Icon } from 'watson-react-components';
import axios from 'axios';
import * as env from './constants';
import ReactModal from 'react-modal';
import DataTable from 'react-data-table-component';
// import sample from './audio/sample.wav';
const MicRecorder = require('mic-recorder').default;

const recorder = new MicRecorder({
  bitRate: 128,
  encoder: 'wav', // default is mp3, can be wav as well
  sampleRate: 44100, // default is 44100, it can also be set to 16000 and 8000.
});

const customStyles = {
  cells: {
    style: {
      paddingTop: '10px',
      paddingBottom: '10px',
    },
  },
};


const recommended =[
{"file":"Audio 1"},
{"file":"Audio 2"},
{"file":"Audio 3"},
{"file":"Audio 4"},
{"file":"Audio 5"}];

const columns = [
  {
    name: 'Audio File',
    selector: 'file',
    sortable: false,
    cell: row => <a href={row.file} target="_blank" style={{color:'orange'}}download>{row.file}</a>,
    wrap: true,
    center: true
  },
];

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
      houndifyText: '',
      showModal: false,
      searchText:'',
      allData:recommended,
      jsonObj : ''
    };
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  componentDidMount(){
    this.getFiles("");
  }

  handleOpenModal () {
    this.setState({ showModal: true });
  }
  
  handleCloseModal () {
    this.setState({ showModal: false });
  }

  record = () => {
    if(!this.state.isRecording){
      this.reset();
      recorder.start().then(() => {
        this.setState({ isRecording: true });
      }).catch((e) => {
        console.error(e);
      });
    }
    else{
      recorder
      .stop()
      .getAudio()
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
      houndifyText: '',
      jsonObj : ''
    })
  }


  getBase64(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    var self = this;
    reader.onload = function () {
      console.log(reader.result);
      const formData = new FormData();
      formData.append('file', reader.result);
      self.uploadRecording('upload', formData)
      setTimeout(function(){
        self.uploadRecording('google',formData);
        self.uploadRecording('sphinx',formData);
        self.uploadRecording('azure',formData);
        self.uploadRecording('deepspeech',formData);
        self.uploadRecording('ibm',formData);
        self.uploadRecording('houndify',formData);
      },1000)


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
    var self = this;
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
              self.setState({ googleText : response.data.input})
              break;
            case 'sphinx':
              self.setState({ spinxText : response.data.input})
              break;
            case 'azure':
              self.setState({ azureText : response.data.input})
              break;
            case 'deepspeech':
              self.setState({ deepText : response.data.input})
              axios({
                method: 'post',
                url: env.nlpURL + 'nlp',
                data: response.data,
                headers: {'Content-Type': 'application/json' }
                })
                .then(function (resp) {
                  //handle success
                  console.log(resp);
                  self.setState({jsonObj:JSON.stringify(resp.data)})
                })
                .catch(function (resp) {
                    //handle error
                    console.log(resp);
                });
              break;
            case 'ibm':
              self.setState({ ibmText : response.data.input})
              break;
            case 'houndify':
              self.setState({ houndifyText : response.data.input})
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

  getFiles(string){
    var self = this;
    if(string === "") {
      axios({
        method: 'GET',
        url: env.nlpURL + "nlpquery?query=",
        headers: {'Content-Type': 'application/json' }
        })
        .then(function (response) {
            //handle success
            console.log(response);
            self.setState({allData:response.data.data})
        })
        .catch(function (response) {
            //handle error
            console.log(response);
        });
    } else {
        axios({
          method: 'GET',
          url: env.nlpURL + "nlpquery?query=" + string,
          headers: {'Content-Type': 'application/json' }
          })
          .then(function (response) {
              //handle success
              console.log(response);
              self.setState({allData:response.data.data})
          })
          .catch(function (response) {
              //handle error
              console.log(response);
          });
    }
  }

  searchButtonClick(){
    console.log(this.state.searchText);
    if(this.state.searchText.trim() === ""){
      this.getFiles("");
    }
    else{
      this.getFiles(this.state.searchText.trim());
    }
  }

  searchInputChange(event){
    this.setState({searchText : event.target.value});
    if(event.target.value.trim() === ""){
      this.getFiles("");
    }
  }


  render(){

    return (
      <div className="App">
        <div className="headerPane">
          <Icon style={{height:'40px'}} type='play' fill='#FFFFFF' /><span className="headerSpan">Transcriber</span>
          <div style={{display:'flex',float:'right',marginRight:'50px',color:'white',fontSize:'20px',position:'relative',top:'6px'}}>
            <span style={{marginRight:'30px',color:'#ef6c00'}}>Home</span>
            <span className="searchLabel" onClick={this.handleOpenModal}>Search</span>
            </div>
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
            <div className="section">Google Speech Recognition</div>
            <div className="message">{this.state.googleText}</div>
          </div>

          <div className="flexCard">
            <div className="section">PocketSphinx</div>
            <div className="message">{this.state.spinxText}</div>
          </div>

          <div className="flexCard">
            <div className="section">Microsoft Azure Speech</div>
            <div className="message">{this.state.azureText}</div>
          </div>
        </div>

        <div className="textPanel">
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

        <div className="textPanel" style={{marginBottom:'20px'}}>
        <div className="flexCard" style={{flex:'0.5'}}> 
            <div className="section">NLP Correction</div>
            <div className="message">{this.state.jsonObj}</div>
          </div>
        </div>

        <ReactModal 
           isOpen={this.state.showModal}
           contentLabel="Minimal Modal Example"
           onRequestClose={this.handleCloseModal}
        >
          <div className="modalHeader">Search Audio</div>
          <div className="modalContent">
            <div><input type="text" className="searchInput" onChange={(e) => this.searchInputChange(e)} /></div>
            <div className="searchButtonDiv"><button className="searchButton" onClick={() => this.searchButtonClick()}><Icon type='search' fill='#FFFFFF' style={{height:'20px'}} /></button></div>

          </div>
          <div style={{padding: '10px 150px'}}>
                  <DataTable
                            columns={columns}
                            center
                            data={this.state.allData}
                            defaultSortField="title"
                            pagination={true}
                            highlightOnHover={true}
                            striped={true}
                            pointerOnHover={true}
                            dense={true}
                            fixedHeader={true}
                            allowOverflow={false}
                            customStyles={customStyles}
                        />
                        </div>
        </ReactModal>
        
        {/* <a href={sample} target="_blank" download>Click to download</a>
        <audio src={sample} controls></audio> */}

      </div>
    );
  }
}

export default App;
