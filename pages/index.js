import {useState, useEffect} from "react";
import {ethers} from "ethers";
import simpleDapp_abi from "../simpleDappABI.json";
import styles from "./index.module.css";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [simpleDapp, setsimpleDapp] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasMinted, setHasMinted] = useState(false);
  const [usersName, setUsersName] = useState("");

  const contractAddress = "0xfEC609820171F36c92e8C20311fAD75De6a5d681";

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account[0]);
      setAccount(account[0]);
    }
    else {
      console.log("No account found");
    }
  }

  useEffect(() => {
    setTimeout(() => {
      alert("IF YOUR NETWORK IS'NT SET TO GOERLI PLEASE CHANGE YOUR NETWORK TO GOERLI");
    }, 2000);
  }, [])
  


  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getsimpleDappContract();
  };

  const getsimpleDappContract = async() => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = await provider.getSigner();
    console.log(`Signer:`, await signer.provider._network);
    const simpleDappContract = new ethers.Contract(contractAddress, simpleDapp_abi, signer);
 
    setsimpleDapp(simpleDappContract);
  }
  
  const populateUserStatus = async() => {
    if (simpleDapp) {
      setHasMinted((await simpleDapp.hasMinted(account)));
      setIsRegistered((await simpleDapp.registeredUsers(account)));
      setUsersName((await simpleDapp.usersName(account)));
    }
  };
  populateUserStatus();
  
  const getBalance = async() => {
    if (simpleDapp) {
      // console.log(`account`, account);
      setBalance((await simpleDapp.userBalances(account)));
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this simpleDapp.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined || balance == NaN) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account? account.slice(0,7)+'....'+account.slice(-7) : "0x000" }</p>
        <p>Your Username: {usersName}</p>
        <p>Your Balance: {Number(balance)}</p>
      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>Welcome to the SimpleDapp Interface!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
      <div className={styles.contents}>
          <div className={styles.contentContainer}>
              {registrationForm()}
          </div>
          <div className={styles.contentContainer}>
              {mintTokens()}
          </div>
          <div className={styles.contentContainer}>
              {transferForm()}
          </div>
      </div>
    </main>
  )
}


const mintTokens = () => {
  const contractAddress = "0xfEC609820171F36c92e8C20311fAD75De6a5d681";
  const [minting, setMinting] = useState(false);

  const mint = async() => {
    // if (isRegistered && simpleDapp && !hasMinted) { 
      try {
          setMinting(true);
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const simpleDappContract = new ethers.Contract(contractAddress, simpleDapp_abi, signer);
          await simpleDappContract.Mint();
          await tx.wait()
          setMinting(false);
          alert("MINT SUCCESSFUL.......Congratulations! 100 tokens has been minted to you");
      } catch (error) {
          alert(error.message);
          setMinting(false);
      }
    // }
  }

  return (
    <div>
      <p> MINT FREE 100 TOKENS TO PROCEED</p>
      <button type="button" onClick={mint} className={styles.button}>{minting ? `Minting....` : `Mint Tokens`}</button>
    </div>
  )
}


const registrationForm = () => {
  const contractAddress = "0xfEC609820171F36c92e8C20311fAD75De6a5d681";
  const [usersName, setUsersName] = useState("");
  const [registering, setRegistering] = useState(false);

  const register = async(e) => {
    e.preventDefault();
    try {
      setRegistering(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const simpleDappContract = new ethers.Contract(contractAddress, simpleDapp_abi, signer);
   
      let tx = await simpleDappContract.Register(usersName);
      await tx.wait()
      setRegistering(false);
      alert("Registration succesfull.... Proceed to mint");

    } catch (e) {
      alert("Error: " + e.message);
      setRegistering(false);
    }

  }

  return (
    <form onSubmit={register}>
      <p>REGISTER TO ACCESS OUR PLATFORM</p>
    <div className={styles.inputField}>
      <label htmlFor="usersName" className={styles.label}>Username:</label>
      <input
        type="text"
        id="usersName"
        className={styles.input}
        value={usersName}
        onChange={(e) => setUsersName(e.target.value)}
        required
      />
    </div>
    <button type="submit" className={styles.button}>{registering? `Registering...` : `Register`}</button>
    </form>
  )
}

const transferForm = () => {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState(0);
  const contractAddress = "0xfEC609820171F36c92e8C20311fAD75De6a5d681";
  const [sending, setSending] = useState(false);

  const transfer = async(e) => {
    e.preventDefault();
    try {
      setSending(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const simpleDappContract = new ethers.Contract(contractAddress, simpleDapp_abi, signer);
   
      let tx = await simpleDappContract.Transfer(to, amount);
      await tx.wait();
      setSending(false);
      alert("Transaction succesfull....");

    } catch (e) {
      // console.log(e.message.transaction);
      alert(e.message);
      setSending(false);
    }
  }

  return (
    <form onSubmit={transfer}>
      <p>TRANSFER TOKENS TO REGISTERED USERS</p>
    <div className={styles.inputField}>
      <label htmlFor="ReiceiverAddress" className={styles.label}>Reiceiver Address:</label>
      <input
        type="text"
        id="ReiceiverAddress"
        className={styles.input}
        value={to}
        onChange={(e) => setTo(e.target.value)}
        required
      />
    </div>
    <div className={styles.inputField}>
      <label htmlFor="amount" className={styles.label}>Amount:</label>
      <input
        type="number"
        id="amount"
        className={styles.input}
        min={0}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
    </div>
    <button type="submit" className={styles.button}>{sending ? `Transfering.....` : `Transfer`}</button>
  </form>
  )

}

