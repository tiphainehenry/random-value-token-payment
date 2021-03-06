import Web3 from 'web3';
import React, { useEffect, useState } from "react";
import erc20Interface from "../contract_interface/MetaCoin.json";
import creatorInterface from "../contract_interface/Creator.json";
import DeployNewToken from './DeployNewToken';
import Escrow from "./Escrow";

export default function Account() {
    const [balance, setBalance] = useState("");
    const [account, setAccount] = useState();
    const [contract_balance_list_s, setcontract_balance_list_s] = useState([]);

    const [contract_list, setContract_list] = useState([]);

    const web3 = new Web3("http://localhost:8545");
    let result_list = [];


    const creatorAddress = "0x3E8B23e576ad350F3f0464a482cb976E6D105231";
    const adr = "0x4936762f3C1B553748851900E60d9DBbcF278d1c";

    async function loadBalance() {
        if(account == null) setAccount(adr);
        let contract_balance_list = [];
        for (var k = 0; k < contract_list.length; k++) {
            try {
                console.log(contract_list[k]);
                var contract = new web3.eth.Contract(erc20Interface.abi, contract_list[k]);
                let result = await contract.methods.balanceOf(account).call();
                contract_balance_list.push({ "contract": contract_list[k], "balance": result });
                console.log(result);
            }
            catch {
                console.log("Contract has been deleted");
            }
        }
        if (contract_balance_list != [] && contract_balance_list.length > 0) {
            console.log(contract_balance_list);
            setcontract_balance_list_s(contract_balance_list);
        }
    }

    useEffect(() => {
        loadBalance();
    }, [contract_list])


    useEffect(() => {
        async function load() {
            const accounts = await web3.eth.getAccounts();
            var creator_contract = new web3.eth.Contract(creatorInterface.abi, creatorAddress);
            result_list = await creator_contract.methods.getAllContract().call();
            setContract_list(result_list);
            console.log(result_list);
            setAccount(accounts[0]);
            loadBalance();
            const bal = await web3.eth.getBalance(adr);
            setBalance(bal);
        };
        load();

    }, []);

    return (
        <>
            <div>
                <p>Balance : {balance.slice(0, balance.length - 18)}.{balance.slice(balance.length - 18, balance.length - 16)} ETH</p>
                <p>Account : {account}</p>  
                <DeployNewToken account={account} />
                <Escrow />

                <table>
                    <tr>
                        <th>Contract Address</th>
                        <th>Balance</th>
                    </tr>
                    {contract_balance_list_s.map((e, index) => {
                        return (
                            <tr id={index}> 
                                <td>
                                    {e.contract.slice(0,8)}
                                </td>
                                <td>
                                    {e.balance == 0 ? 0 : e.balance.slice(0, e.balance.length - 2)}.{e.balance.slice(e.balance.length - 3, e.balance.length - 1)}
                                </td>
                            </tr>
                        );
                    }
                    )}
                </table>
                <p> </p>
            </div>
        </>
    );
}