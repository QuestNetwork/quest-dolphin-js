const { v4: uuidv4 } = require('uuid');
import { Subject } from "rxjs";

import { GlobalPubSub as QuestPubSub }  from '@questnetwork/quest-pubsub-js';

export class Dolphin {
    constructor(ipfsNode) {
      this.ipfsNode = ipfsNode;
      this.commitNowSub = new Subject();
      let uVar;
      this.selectedChannel = uVar;
      this.selectedChannelSub = new Subject<any>();
    }

    constructor(private ipfs:IpfsService, private ui: UiService) {
      QuestPubSub.commitNowSub.subscribe( (value) => {
        this.commitNowSub.next(value);
      });
    }

    isInArray(value, array) {
     return array.indexOf(value) > -1;
   }

   public selectChannel(value){
     this.selectedChannel = value;
     this.selectedChannelSub.next(value);
   }
   public getSelectedChannel(){
     return this.selectedChannel;
   }
    listen(channel){
        return QuestPubSub.subs[channel];
    }

    async createChannel(channelInput, isClean = false){
        //generate keypair and register channel

        //clean the Input
        channelInput = channelInput.toLowerCase().replace(/[^A-Z0-9]+/ig, "-");

        let channelName = await QuestPubSub.createChannel(channelInput);
        this.getChannelKeyChain(channelName);
        this.getChannelParticipantList(channelName);
        return channelName;
    }

    async addChannel(channelName){
        //clean the Input
        await QuestPubSub.addChannel(channelName);
        this.getChannelKeyChain(channelName);
        this.getChannelParticipantList(channelName);
        return channelName;
    }

    getChannelParticipantList(channel = "all"){
      let pl = QuestPubSub.getChannelParticipantList(channel);
      this.setChannelParticipantList(pl, channel);
      return pl;
    }
    setChannelParticipantList(partList, channel = "all"){
      return QuestPubSub.setChannelParticipantList(partList, channel);
    }

    channelNameListSub = new Subject();
    getChannelNameList(){
      return QuestPubSub.getChannelNameList();
    }
    setChannelNameList(list){
      this.channelNameListSub.next(list);
      QuestPubSub.setChannelNameList(list);
    }

    setChannelKeyChain(channelKeyChain, channel = "all"){
      return QuestPubSub.setChannelKeyChain(channelKeyChain, channel);
    }
    getChannelKeyChain(channel = 'all'){
      let kc = QuestPubSub.getChannelKeyChain(channel);
      this.setChannelKeyChain(kc, channel);
      return kc;
    }

    getIpfsId(){
      return QuestPubSub.getIpfsId();
    }
    setIpfsId(id){
      return QuestPubSub.setIpfsId(id);
    }

    getPubSubPeersSub(){
      return QuestPubSub.pubSubPeersSub;
    }

    async joinChannelProcess(channel){
       //TODO: we can retry and all that
    await QuestPubSub.joinChannel(this.ipfsNode.pubsub,channel);
    }

    async completedChallenge(channel, code){
      let ownerChannelPubKey = QuestPubSub.getOwnerChannelPubKey(channel);
      let pubObj = {
        channel: channel,
        type: 'CHALLENGE_RESPONSE',
        toChannelPubKey: ownerChannelPubKey,
        response: { code: code }
      }
      QuestPubSub.publish(this.ipfsNode.pubsub,pubObj);
    }

    async joinChannel(channel){
      try {
        if(this.ipfs.isReady()){
            return await this.joinChannelProcess(channel);
        }
        else{
          console.log('Waiting for ipfsNodeReadySub...');
          this.ipfsNodeReadySub.subscribe(async () => {
            return await this.joinChannelProcess(channel);
          });
        }
      }
      catch(error){
        console.log(error);
      }
    }

    async publishChannelMessage(channel, message){
      let pubObj = { channel: channel, type: 'CHANNEL_MESSAGE',message }
      QuestPubSub.publish(this.ipfsNode.pubsub,pubObj);
    }

    getChannelHistory(channel){
      return QuestPubSub.getChannelHistory(channel);
    }

    isSubscribed(channel){
      return QuestPubSub.isSubscribed(channel);
    }

    isOwner(channel, pubkey = "none"){
      return QuestPubSub.isOwner(channel,pubkey);
    }

    setInviteCodes(inviteObject, channel = 'all'){
      QuestPubSub.setInviteCodes(inviteObject, channel);
      return true;
    }

    getInviteCodes(channel = 'all'){
      return QuestPubSub.getInviteCodes(channel);
    }
    addInviteCode(channel,link,code,newInviteCodeMax){
      return QuestPubSub.addInviteCode(channel,link,code,newInviteCodeMax);
    }
    addInviteToken(channel,token){
      return QuestPubSub.addInviteToken(channel,token);
    }
    removeInviteCode(channel,link){
      return QuestPubSub.removeInviteCode(channel, link)
    }

  }