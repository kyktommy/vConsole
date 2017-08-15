/**
 * A Front-End Console Panel for Mobile Webpage base on WechatFE
 *
 * @author kyktommy
 */

import React from 'react';

import './vconsole.less';

const mockConsole = {};

class VConsole extends React.Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      isShowing: false,
      tabNameActived: 'default',
      logs: [],
    }
  }
  
  componentWillMount() {
    this.autoRun(this.setLoadTiming.bind(this));
    this.makeMockConsole(this.printLog.bind(this));
  }
  
  componentDidMount() {
  }
  
  componentWillUnmount() {
    this.unMockConsole();
  }
  
  setLoadTiming(loadTiming) {
    for (var key in loadTiming) {
      this.printLog('system', 'debug', [`${key}: ${loadTiming[key]}`]);
    }
  }
  
  showTab(tabName) {
    this.setState({tabNameActived: tabName});
    this.scrollBottom();
  }
  
  scrollBottom() {
    if (window && window.document) {
      var vcContent = document.getElementsByClassName('vc-content')[0];
      if (vcContent) {
        vcContent.scrollTop = vcContent.scrollHeight;
      }
    }
  }
  
  show() {
    this.setState({isShowing: true});
  }
  
  hide() {
    this.setState({isShowing: false});
  }
  
  getTabClass(tabName) {
    if (this.state.tabNameActived == tabName) {
      return "vc-tab vc-actived";
    } else {
      return "vc-tab";
    }
  }
  
  getLogBoxClass(tabName) {
    if (this.state.tabNameActived == tabName) {
      return "vc-logbox vc-actived";
    } else {
      return "vc-logbox";
    }
  }
  
  printLog(tabName, logType, logs) {
    if (!logs.length) return;

    var line = '';
    for (var i=0; i<logs.length; i++) {
      try {
        if (typeof logs[i] == 'function') {
          line += ' ' + logs[i].toString();
        } else if (typeof logs[i] == 'object') {
          line += ' ' + JSON.stringify(logs[i]);
        } else {
          line += ' ' + logs[i];
        }
      } catch (e) {
        line += ' [' + (typeof logs[i]) + ']';
      }
    }
    
    var _logs = this.state.logs;
    _logs[tabName] = _logs[tabName] || [];
    _logs[tabName].push({logType: logType, line: line});
    this.setState({logs: _logs});
  }
  
  makeMockConsole(printLogFn) {
    var {consoleInstance} = this.props;
    if (!consoleInstance) return;
    
    var oldLog = (logType, logs) => {
      mockConsole[logType].apply(window.console, arguments);
    }
    
    mockConsole.log = consoleInstance.log;
    mockConsole.info = consoleInstance.info;
    mockConsole.warn = consoleInstance.warn;
    mockConsole.debug = consoleInstance.debug;
    mockConsole.error = consoleInstance.error;
    
    consoleInstance.log = function() { printLogFn('default', 'log', arguments); oldLog('log', arguments); };
    consoleInstance.info = function() { printLogFn('default', 'info', arguments); oldLog('info', arguments); };
    consoleInstance.warn = function() { printLogFn('default', 'warn', arguments); oldLog('warn', arguments); };
    consoleInstance.debug = function() { printLogFn('default', 'debug', arguments); oldLog('debug', arguments); };
    consoleInstance.error = function() { printLogFn('default', 'error', arguments); oldLog('error', arguments); };
  }

  unMockConsole() {
    var {consoleInstance} = this.props;
    if (!consoleInstance) return;
    
    consoleInstance.log = mockConsole.log;
    consoleInstance.info = mockConsole.info;
    consoleInstance.warn = mockConsole.warn;
    consoleInstance.debug = mockConsole.debug;
    consoleInstance.error = mockConsole.error;
  }
  
  autoRun(cb) {
    var loadTiming = {};
    window.addEventListener('load', function(e) {
      var performance = window.performance || window.msPerformance || window.webkitPerformance;
      if (performance && performance.timing) {
        var t = performance.timing, start = t.navigationStart;
        loadTiming.connectTime = t.connectEnd - start + 'ms';
        loadTiming.responseTime = t.responseEnd - start + 'ms';
        if (t.secureConnectionStart > 0) {
          loadTiming.sslTime = t.connectEnd - t.secureConnectionStart + 'ms';
        }
        loadTiming.domRenderTime = t.domComplete - t.domLoading + 'ms';
      }
      if (cb) cb(loadTiming);
    });
  }
  
  clear() {
    var {logs, tabNameActived} = this.state;
    logs[tabNameActived] = [];
    this.setState({logs});
  }

  renderLogs(tabName) {
    var {logs} = this.state;
    logs[tabName] = logs[tabName] || [];
    var logss = logs[tabName];
    
    return logss.map((l, i) => 
      <Log key={i} 
        tabName={tabName} 
        logType={l.logType} 
        line={l.line} />);
  }
  
  render() {
    
    var isShowingClass = this.state.isShowing ? 'vc-toggle' : '';
    var defaultLogs = this.renderLogs('default');
    var defaultTabClass = this.getTabClass('default');
    var defaultLogBoxClass = this.getLogBoxClass('default');
    var systemLogs = this.renderLogs('system');
    var systemTabClass = this.getTabClass('system');
    var systemLogBoxClass = this.getLogBoxClass('system');
    
    return(
      <div id="__vconsole" className={isShowingClass}>
        <div className="vc-show" onClick={this.show.bind(this)}>VConsole</div>
        <div className="vc-mask" onClick={this.hide.bind(this)}>
        </div>
        <div className="vc-panel">
          <div className="vc-tabbar">
            <a className={defaultTabClass} onClick={() => this.showTab('default')} href="javascript:;">Logs</a>
            <a className={systemTabClass} onClick={() => this.showTab('system')} href="javascript:;">System</a>
          </div>
          <div className="vc-content">
            <div className={defaultLogBoxClass}>
              <div className="vc-log">
                { defaultLogs }
              </div>
            </div>
            <div className={systemLogBoxClass}>
              <div className="vc-log">
                { systemLogs }
              </div>
            </div>
          </div>
          <div className="vc-toolbar">
            <a href="javascript:;" className="vc-tool vc-clear" onClick={this.clear.bind(this)}>Clear</a>
            <a href="javascript:;" className="vc-tool vc-tool-last vc-hide" onClick={this.hide.bind(this)}>Hide</a>
          </div>
        </div>
      </div>
    );
  }
}

class Log extends React.Component {
  
  constructor(props) {
    super(props);
  }
  
  render() {
    var {tabName, logType, line} = this.props;
    
    return (
      <div className={"__vc_log_"+ tabName}>
        <p className={"vc-item vc-item-" + logType}>
          {line}
        </p>
      </div>
    );
  }
}

VConsole.PropTypes = {
  consoleInstance: React.PropTypes.object,
}

VConsole.defaultProps = {
  consoleInstance: window ? window.console : null,
}

if (window) {
  window.VConsole = VConsole;
}

export default VConsole;