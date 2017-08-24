var accounts;
var account;

function setStatus(message) {
  var status = document.getElementById("status");
  status.innerHTML = message;
  status.style.display = 'block';
  setTimeout(function() {
    var status = document.getElementById("status");
    status.style.display = 'none';
  },10000);
};

function clearTable(){
   var table = document.getElementById("bets");
   var rowCount = table.rows.length;
   for (var i = 1; i < rowCount; i++) {
      table.deleteRow(1);
   }
}

function formatDate(date) {
  var monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var ampm = 'AM';
  if (date.getHours() < 10) {
    hour = '0' + date.getHours();
  }
  if (date.getHours() > 12) {
    hour = date.getHours() - 12;
    ampm = 'PM';
  } else if (date.getHours() == 12) {
    ampm = 'PM';
  }
  if (date.getMinutes() < 10) {
    minute = '0' + date.getMinutes();
  }

  return day + '-' + monthNames[monthIndex] + '-' + year + ' ' + hour + ':' + minute + ' ' + ampm;
}

function showBetScreen() {
    hideBetAgainstScreen();
    var newBetDiv = document.getElementById("newBetDiv");
    newBetDiv.style.display = 'block';
}

function hideBetScreen() {
    var newBetDiv = document.getElementById("newBetDiv");
    newBetDiv.style.display = 'none';
}

function showBetAgainstScreen() {
    hideBetScreen();
    var betAgainstDiv = document.getElementById("betAgainstDiv");
    betAgainstDiv.style.display = 'block';
}

function hideBetAgainstScreen() {
    var betAgainstDiv = document.getElementById("betAgainstDiv");
    betAgainstDiv.style.display = 'none';
}

function betAgainst(betIndex, better, assert) {
  var selectedBetter = document.getElementById("selectedBetter");
  selectedBetter.innerHTML = better;
  var selectedAssert = document.getElementById("selectedAssert");
  selectedAssert.innerHTML = assert;
  var selectedBetIndex = document.getElementById("selectedBetIndex");
  selectedBetIndex.value = betIndex;

  showBetAgainstScreen();
}

function betAgainstAction() {
  var better = document.getElementById("userAddressInput").value;
  var nameOfAsset = document.getElementById("againsterNameOfAsset").value;
  var selectedBetter = document.getElementById("selectedBetter").innerHTML;
  var selectedAssert = document.getElementById("selectedAssert").innerHTML;
  var selectedBetIndex = document.getElementById("selectedBetIndex").value;

  if (better == '') {
    alert ("Your address is empty!");
    return;
  } else if (nameOfAsset == '') {
    alert ("Your Asset is empty!");
    return;
  } else if (better == selectedBetter) {
    alert ("You can not bet against your bet!");
    return;
  }  else if (nameOfAsset == selectedAssert) {
    alert ("Assert are same, provide different assert!");
    return;
  } else {
    var betContract = BetContract.deployed();
    betContract.checkBetAgainst.call(parseInt(selectedBetIndex), better, nameOfAsset, {from: better}).then(function(value) {
      if (value == 1){
        doBet(selectedBetIndex, better, nameOfAsset);
      } else if (value == 2 || value == 4) {
        alert ("You don't have chance to bet this!");
      } else if (value == 3) {
        alert ("The bet is expired!");
      }
    }).catch(function(e) {
      console.log(e);
      setStatus("Error in bet. see log.");
    });
  }
}

function doBet(selectedBetIndex, better, nameOfAsset) {
  var betContract = BetContract.deployed();
  betContract.betAgainst(selectedBetIndex, better, nameOfAsset, {from: better}).then(function() {
    document.getElementById("againsterNameOfAsset").value = '';
    setStatus("Bet Successful!");
    hideBetAgainstScreen();
    listBets();
  }).catch(function(e) {
    console.log(e);
    setStatus("Error in bet. see log.");
  });
}

function getStatus(value) {
  var status = '';
  if (value == 0) {
    status = '<span class="created">CREATED</span>';
  } else if (value == 1) {
    status = '<span class="locked">LOCKED</span>';
  } else if (value == 2) {
    status = '<span class="completed">COMPLETED</span>';
  } else if (value == 3) {
    status = '<span class="expired">EXPIRED</span>';
  }
  return status;
}

function getActionButton(value, index, better, assert) {
  var action = '';
  if (value == 0) {
    action = "<button onclick='betAgainst("+(index-2)+", \""+ better +"\", \""+ assert +"\")'>Bet</button>";
  } else if (value == 1) {
    action = "";
  } else if (value == 2) {
    action = "";
  } else if (value == 3) {
    action = "";
  }
  return action;
}

function getChannelDetails(betCount) {
  clearTable();
  var index = 1;
  var betContract = BetContract.deployed();
  for (var i = 0; i < betCount; i++) {
    betContract.getBetterDetail.call(i, {from: account}).then(function(detail) {
      var table = document.getElementById("bets");
      var row = table.insertRow(index);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      var cell4 = row.insertCell(3);
      var cell5 = row.insertCell(4);
      var cell6 = row.insertCell(5);
      var cell7 = row.insertCell(6);
      var cell8 = row.insertCell(7);
      var cell9 = row.insertCell(8);
      var cell10 = row.insertCell(9);

      var assets = detail[1].split(":::");
      cell1.innerHTML = (index++);
      cell2.innerHTML = detail[0];
      cell3.innerHTML = assets[0];
      cell4.innerHTML = detail[2].valueOf() + ' ETH';
      cell5.innerHTML = formatDate(new Date(parseInt(detail[3])));
      cell6.innerHTML = formatDate(new Date(parseInt(detail[4])));
      if (detail[5] != '0x0000000000000000000000000000000000000000') {
        cell7.innerHTML = detail[5];
      }
      cell8.innerHTML = assets[1];
      cell9.innerHTML = getStatus(detail[6].valueOf());
      cell10.innerHTML = getActionButton(detail[6].valueOf(), index, detail[0], assets[0]);

      if (assets[2] == 'better') {
        cell2.style.fontWeight = 'bold';
        cell3.style.fontWeight = 'bold';
        cell2.style.color = '#00b100';
        cell3.style.color = '#00b100';
      } else if (assets[2] == 'againster') {
        cell7.style.fontWeight = 'bold';
        cell8.style.fontWeight = 'bold';
        cell7.style.color = '#00b100';
        cell8.style.color = '#00b100';
      }

    }).catch(function(e) {
      console.log(e);
      setStatus("Error getting bet detail; see log.");
    });
  }
}

function listBets() {
  var betContract = BetContract.deployed();
  betContract.getBetCount.call({from: account}).then(function(value) {
    var betCount_element = document.getElementById("betCount");
    betCount_element.innerHTML = value.valueOf();
    getChannelDetails(value.valueOf());
  }).catch(function(e) {
    console.log(e);
    setStatus("Error getting bet list count; see log.");
  });
}

function findWinners() {
  var betContract = BetContract.deployed();
  betContract.updateBetWinner({from: account, gas: 4712388}).then(function() {
    listBets();
  }).catch(function(e) {
    console.log(e);
    setStatus("Error getting calculating bet winners; see log.");
  });
}

function startNewBet() {
  var better = document.getElementById("userAddressInput").value;
  var nameOfAsset = document.getElementById("nameOfAsset").value;
  var amountOfBet = parseInt(document.getElementById("amountOfBet").value);
  var startTime = Date.parse(document.getElementById("startTime").value);
  var endTime = Date.parse(document.getElementById("endTime").value);

  if (better == '') {
    alert ("Your address is empty!");
    return;
  } else if (nameOfAsset == '') {
    alert ("Name of Asset is empty!");
    return;
  } else if (amountOfBet == '') {
    alert ("Amount of Bet is empty!");
    return;
  }  else if (isNaN(startTime)) {
    alert ("Start Time is empty!");
    return;
  } else if (isNaN(endTime)) {
    alert ("End Time is empty!");
    return;
  } else if (startTime >= endTime) {
    alert ("Start Time is greater then or equals to End Time!");
    return;
  } else {
    var betContract = BetContract.deployed();
    var formatedStartDate = new Date(startTime);
    formatedStartDate.setTime(formatedStartDate.getTime() - (19800000));
    var formatedEndDate = new Date(endTime);
    formatedEndDate.setTime(formatedEndDate.getTime() - (19800000));
    betContract.startBet(better, nameOfAsset, amountOfBet, Date.parse(formatedStartDate), Date.parse(formatedEndDate), {from: account, gas: 4712388}).then(function() {
      document.getElementById("nameOfAsset").value = '';
      document.getElementById("amountOfBet").value = '';
      document.getElementById("startTime").value = '';
      document.getElementById("endTime").value = '';
      setStatus("New Bet Started!");
      listBets();
    }).catch(function(e) {
      console.log(e);
      setStatus("Error in adding new channel. see log.");
    });
  }
}

window.onload = function() {
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    account = accounts[0];
    listBets();
  });
}
