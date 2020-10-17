const { v4: uuidv4 } = require('uuid');
import { Subject } from "rxjs";

import { GlobalPubSub as QuestPubSub }  from '@questnetwork/quest-pubsub-js';

export class Dolphin {
    constructor(ipfsNode) {
      this.ipfsNode = ipfsNode;
      this.commitNowSub = new Subject();
      this.commitSub = new Subject();
      this.channelConfig = {};

      let uVar;

      this.channelNameListSub = new Subject();
      QuestPubSub.commitNowSub.subscribe( (value) => {
        this.commitNowSub.next(value);
      });
      QuestPubSub.commitSub.subscribe( (value) => {
        this.commitSub.next(value);
      });
    }


    async sayHi(channel){
      return QuestPubSub.sayHi(this.ipfsNode.pubsub, channel)
    }


   getChallengeFlag(ch){
     return QuestPubSub.getChallengeFlag(ch);
   }
   setChallengeFlag(ch, value){
      QuestPubSub.setChallengeFlag(ch, value);
   }
   getChannelConfig(ch = 'all'){
     return QuestPubSub.getChannelConfig(ch);
   }
   setChannelConfig(config, ch = 'all'){
     QuestPubSub.setChannelConfig(config, ch);
   }


    listen(channel){
        return QuestPubSub.subs[channel];
    }

    isOnline(channelPubKey){
        return QuestPubSub.isAlive(channelPubKey);
    }


    getIncomingFavoriteRequests(){
      return QuestPubSub.getIncomingFavoriteRequests();
    }
    setIncomingFavoriteRequests(v){
       QuestPubSub.setIncomingFavoriteRequests(v);
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
    // async addChannelFromInvite(channelName){
    //     //clean the Input
    //     await QuestPubSub.addChannel(channelName);
    //     let kc = QuestPubSub.getChannelKeyChain(channel);
    //     this.setChannelKeyChain(kc, channel);
    //     let plist = QuestPubSub.generateChannelParticipantListFromChannelName();
    //     this.setChannelParticipantList(plist,channelName);
    //     return channelName;
    // }

    getChannelParticipantList(channel = "all"){
      let pl = QuestPubSub.getChannelParticipantList(channel);
      this.setChannelParticipantList(pl, channel);
      return pl;
    }
    setChannelParticipantList(partList, channel = "all"){
      return QuestPubSub.setChannelParticipantList(partList, channel);
    }


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
      code = Buffer.from(code,'hex').toString('utf8').split(':')[1];
      console.log(code);
      let pubObj = {
        channel: channel,
        type: 'CHALLENGE_RESPONSE',
        toChannelPubKey: ownerChannelPubKey,
        response: { code: code }
      }
      QuestPubSub.publish(this.ipfsNode.pubsub,pubObj);
    }

    async joinChannel(channel){
      // try {
      //   if(this.ipfs.isReady()){
            return await this.joinChannelProcess(channel);
        // }
        // else{
        //   console.log('Waiting for ipfsNodeReadySub...');
        //   this.ipfsNodeReadySub.subscribe(async () => {
        //     return await this.joinChannelProcess(channel);
        //   });
        // }
      // }
      // catch(error){
      //   console.log(error);
      // }
    }

    async publishChannelMessage(channel, message, type = 'CHANNEL_MESSAGE'){
      let pubObj = { channel: channel, type: type,message }
      QuestPubSub.publish(this.ipfsNode.pubsub,pubObj);
    }

    async publish(channel, pubObj, type = 'CHANNEL_MESSAGE'){
      if(typeof pubObj != 'object'){
        pubObj = { message: pubObj };
      }
      pubObj['type'] = type;
      pubObj['channel'] = channel;
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

    setSocialProfiles(v){
      QuestPubSub.setSocialProfiles(v);
    }
    setSocialProfile(profileId, v){
      QuestPubSub.setSocialProfile(profileId,v);
    }
    getSocialProfiles(){
      return QuestPubSub.getSocialProfiles();
    }
    setSocialSharedWith(array){
      QuestPubSub.setSocialSharedWith(array);
    }
    clearSharedWith(){
      QuestPubSub.setSocialSharedWith([]);
    }
    getSocialSharedWith(){
       return QuestPubSub.getSocialSharedWith();
    }
    clearSocialSharedWith(){
       QuestPubSub.clearSocialSharedWith();
    }
    setSocialLinks(v){
      QuestPubSub.setSocialLinks(v);
    }
    getSocialLinks(){
      return QuestPubSub.getSocialLinks();
    }

    commitNow(){
      this.commitNowSub.next(true);
    }

    commit(){
      this.commitSub.next(true);
    }

    removeIncomingFavoriteRequest(pubKey){
      QuestPubSub.removeIncomingFavoriteRequest(pubKey);
    }

  }
