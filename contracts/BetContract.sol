pragma solidity ^0.4.8;
contract BetContract {

  address public owner; // address of the betContract

	function BetContract() {
		owner = msg.sender;
	}

  // modifier to allow only owner has full control on the function
	modifier onlyOwnder {
		if (msg.sender != owner) {
			throw;
		} else {
			_;
		}
	}

	// Delete / kill the contract... only the owner has rights to do this
	function kill() onlyOwnder {
		suicide(owner);
	}

  // Status in each stage of Bet
  enum Status {CREATED, LOCKED, COMPLETED, EXPIRED}

  // Bet object
  struct Bet {
    address better;
    string betterNameOfAsset;
    uint amountOfBet;
    uint startTime;
    uint endTime;
    Status status;
    address againster;
    string againsterNameOfAsset;
    string winner;
  }

  // list of bets
  Bet[] public bets;

  // Create or start new bet by better
  function startBet(address _better, string _betterAsset, uint _amountOfBet, uint _startTime, uint _endTime) {
    uint betIndex = bets.length++;

		bets[betIndex].better = _better;
		bets[betIndex].betterNameOfAsset = _betterAsset;
		bets[betIndex].amountOfBet = _amountOfBet;
		bets[betIndex].startTime = _startTime;
		bets[betIndex].endTime = _endTime;
    bets[betIndex].status = Status.CREATED;
  }

  // Bet against the existing bet created by better
  function betAgainst(uint betIndex, address _againster, string _againsterAsset) payable {
    bets[betIndex].againster = _againster;
    bets[betIndex].againsterNameOfAsset = _againsterAsset;
    bets[betIndex].status = Status.LOCKED;
  }

  // Bet against the existing bet created by better
  function checkBetAgainst(uint betIndex, address _againster, string _againsterAsset) public constant returns (uint) {
    if (bets.length > betIndex) {
      if (bets[betIndex].status == Status.CREATED) {
        uint nowTime = now * 1000;
        if (bets[betIndex].startTime > nowTime) {
          if (sha3(bets[betIndex].againsterNameOfAsset) == sha3("")) {
            return 1;
          } else {
            return 4;
          }
        } else {
          bets[betIndex].status = Status.LOCKED;
          return 3;
        }
      } else {
        return 2;
      }
    } else {
      return 0;
    }
  }

  // Find the winner and send the winning money of 95%
  function updateBetWinner() onlyOwnder {
    uint random = 1;

    for (uint i = 0; i < bets.length; i++) {
      uint nowTime = now * 1000;
      if (bets[i].endTime < nowTime) {
        if (bets[i].status == Status.LOCKED) {
          address winner;
            if (random%2 == 0) {
              bets[i].winner = "better";
              winner = bets[i].better;
            } else {
              bets[i].winner = "againster";
              winner = bets[i].againster;
            }

  					if (winner.send(bets[i].amountOfBet * 95/100)) {
  						throw;
  					}
            bets[i].status = Status.COMPLETED;

        } else if (bets[i].status == Status.CREATED) {
          bets[i].status = Status.EXPIRED;
        }
        random++;
      }
    }
  }

  // Get bets list count
  function getBetCount() public constant returns (uint) {
		return bets.length;
	}

  // This helps to send the multiple strigs as single to avoid too many parameter returns from the contract
  function strConcat(string _a, string _b, string _c, string _d, string _e) internal returns (string){
      bytes memory _ba = bytes(_a);
      bytes memory _bb = bytes(_b);
      bytes memory _bc = bytes(_c);
      bytes memory _bd = bytes(_d);
      bytes memory _be = bytes(_e);
      string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
      bytes memory babcde = bytes(abcde);
      uint k = 0;
      for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
      for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
      for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
      for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
      for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
      return string(babcde);
  }

  // Get Bet detail to display in the table
  function getBetterDetail(uint betIndex) public constant returns (address, string, uint, uint, uint, address, Status) {
    return (bets[betIndex].better, strConcat(bets[betIndex].betterNameOfAsset, ":::", bets[betIndex].againsterNameOfAsset, ":::", bets[betIndex].winner), bets[betIndex].amountOfBet, bets[betIndex].startTime, bets[betIndex].endTime, bets[betIndex].againster, bets[betIndex].status);
  }
}
