import { HostListener, OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Guid } from "guid-typescript";

import { BingoService } from '../shared/bingo.service';

import { BingoResultComponent } from '../bingo-result/bingo-result.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-bingo-new-game',
  templateUrl: './bingo-new-game.component.html',
  styleUrls: ['./bingo-new-game.component.scss']
})

export class BingoNewGameComponent implements OnInit, OnDestroy {

  bingoNewCards: string[][] = [];

  firstRowCard: string[] = [];
  secondRowCard: string[] = [];
  thirdRowCard: string[] = [];
  fourthRowCard: string[] = [];
  fifthRowCard: string[] = [];

  diagonalFirstResult: string[] = [];
  diagonalSecondResult: string[] = [];
  userFoundCards: string[] = [];
  displayedTokens: string[] = [];

  bingoTokensSource: { card: string, value: string }[] = [];

  uniqueId: string = Guid.create().toString();

  tokenToRender: any;
  bingoServiceSubscription: any;
  intervalId: any;

  invalidTimeInterval: string = '';
  pausePlayToken: string = 'Pause';
  invalidName: string = '';
  deSelectMessage: string = '';

  currentTokenNumber: number = 0;

  isTokenIntervalReadonly = false;
  newGameStarted = false;
  showTip = true;
  useServerAPI: boolean = false;
  confirmResult: any;
  userName: string = '';
  tokenInterval: number = 10;
  cacheDataDays: number = 2;
  isCacheDataChecked = false;

  constructor(private bingoService: BingoService, private dialog: MatDialog) { }

  ngOnInit(): void {

    let DateCreated = new Date(this.GetDataFromLocalStorage('DateCreated'));
    const today = new Date();
    const timeDifference = today.getTime() - DateCreated.getTime();
    const dayDifference = timeDifference / (1000 * 3600 * 24);

    if (dayDifference > this.cacheDataDays) {
      localStorage.clear();
    }

    if (this.GetLocalStorage()) {
      this.bingoNewCards.push(this.firstRowCard.slice(0, 5));
      this.bingoNewCards.push(this.secondRowCard.slice(0, 5));
      this.bingoNewCards.push(this.thirdRowCard.slice(0, 5));
      this.bingoNewCards.push(this.fourthRowCard.slice(0, 5));
      this.bingoNewCards.push(this.fifthRowCard.slice(0, 5));

      this.bingoServiceSubscription = this.bingoService.generateBingoToken().subscribe(items => {
        this.bingoTokensSource = items;
      });

      this.showTip = false;
      this.isTokenIntervalReadonly = true;
      this.pausePlayToken = 'Start';
      return;
    }
    else {
      this.userFoundCards.length = 0;
      this.displayedTokens.length = 0;

      this.firstRowCard.length = 0;
      this.secondRowCard.length = 0;
      this.thirdRowCard.length = 0;
      this.fourthRowCard.length = 0;
      this.fifthRowCard.length = 0;

      this.diagonalFirstResult.length = 0;
      this.diagonalSecondResult.length = 0;

      this.firstRowCard = ["B1", "I1", "N1", "G1", "O1"];
      this.secondRowCard = ["B2", "I2", "N2", "G2", "O2"];
      this.thirdRowCard = ["B3", "I3", "N3", "G3", "O3"];
      this.fourthRowCard = ["B4", "I4", "N4", "G4", "O4"];
      this.fifthRowCard = ["B5", "I5", "N5", "G5", "O5"];

      this.tokenInterval = 10;
      this.currentTokenNumber = 0;
      this.userName = '';
      this.newGameStarted = false;
      this.isCacheDataChecked = false;
    }

    this.bingoNewCards.push(this.firstRowCard.slice(0, 5));
    this.bingoNewCards.push(this.secondRowCard.slice(0, 5));
    this.bingoNewCards.push(this.thirdRowCard.slice(0, 5));
    this.bingoNewCards.push(this.fourthRowCard.slice(0, 5));
    this.bingoNewCards.push(this.fifthRowCard.slice(0, 5));
    this.newGameStarted = false;
  }

  ngOnDestroy(): void {
    this.bingoServiceSubscription.unsubscribe();
  }

  async CreateNewBoard(): Promise<void> {

    const userName = this.userName;
    if (userName === '') {
      this.invalidName = "Name is required to proceed"
      return;
    }
    else {
      this.invalidName = ""
    }

    if (this.newGameStarted) {
      await this.openDialog();
      if (this.confirmResult && this.confirmResult === true) {
        // do nothing!!
      }
      else {
        return;
      }
    }

    this.showTip = false;

    this.bingoNewCards.length = 0;
    this.firstRowCard.length = 0;
    this.secondRowCard.length = 0;
    this.thirdRowCard.length = 0;
    this.fourthRowCard.length = 0;
    this.fifthRowCard.length = 0;
    this.displayedTokens.length = 0;
    this.userFoundCards.length = 0;
    this.currentTokenNumber = 0;
    this.diagonalFirstResult.length = 0;
    this.diagonalSecondResult.length = 0;

    this.pausePlayToken = 'Pause';
    this.tokenToRender = '';
    this.deSelectMessage = '';


    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    let sameCardData = true;
    while (sameCardData) {

      this.SetBingoData();

      if (this.BingoDataDuplicated(this.firstRowCard, this.secondRowCard) || this.BingoDataDuplicated(this.firstRowCard, this.thirdRowCard) || this.BingoDataDuplicated(this.firstRowCard, this.fourthRowCard) ||
        this.BingoDataDuplicated(this.firstRowCard, this.fifthRowCard) || this.BingoDataDuplicated(this.secondRowCard, this.thirdRowCard) || this.BingoDataDuplicated(this.secondRowCard, this.fourthRowCard) ||
        this.BingoDataDuplicated(this.secondRowCard, this.fifthRowCard) || this.BingoDataDuplicated(this.thirdRowCard, this.fourthRowCard) || this.BingoDataDuplicated(this.thirdRowCard, this.fifthRowCard) ||
        this.BingoDataDuplicated(this.fourthRowCard, this.fifthRowCard)) {
        sameCardData = true;
        this.bingoNewCards.length = 0;
        this.firstRowCard.length = 0;
        this.secondRowCard.length = 0;
        this.thirdRowCard.length = 0;
        this.fourthRowCard.length = 0;
        this.fifthRowCard.length = 0;
      }
      else {
        sameCardData = false;
      }
    }

    this.bingoNewCards.push(this.firstRowCard.slice(0, 5));
    this.bingoNewCards.push(this.secondRowCard.slice(0, 5));
    this.bingoNewCards.push(this.thirdRowCard.slice(0, 5));
    this.bingoNewCards.push(this.fourthRowCard.slice(0, 5));
    this.bingoNewCards.push(this.fifthRowCard.slice(0, 5));

    let diagonalResult = [this.firstRowCard[0], this.secondRowCard[1], this.thirdRowCard[2], this.fourthRowCard[3], this.fifthRowCard[4]];
    this.diagonalFirstResult = this.CustomBingoSort(diagonalResult);


    diagonalResult = [this.firstRowCard[4], this.secondRowCard[3], this.thirdRowCard[2], this.fourthRowCard[1], this.fifthRowCard[0]];
    this.diagonalSecondResult = this.CustomBingoSort(diagonalResult);

    this.isTokenIntervalReadonly = true;
    this.newGameStarted = true;

    this.bingoServiceSubscription = this.bingoService.generateBingoToken().subscribe(items => {
      this.bingoTokensSource = items;
      this.renderTokensSequentially();
    });

    if (this.isCacheDataChecked) {
      this.SetLocalStorage();
    }

  }

  CacheData(checked: boolean) {
    this.isCacheDataChecked = checked;

    if (!this.newGameStarted) {
      return;
    }

    if (checked) {
      this.SetLocalStorage();
    }
    else {
      localStorage.clear();
    }
  }

  ResetSelection(): void {
    this.userFoundCards.length = 0;
    this.deSelectMessage = '';
  }

  UnsubscribeTokens(checkBingoButtonClick: boolean) {

    if (checkBingoButtonClick) {
      return;
    }

    if (this.tokenInterval === null || this.tokenInterval <= 0) {
      this.invalidTimeInterval = 'Invalid time interval, provide a valid time value to continue';
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    if (this.pausePlayToken === 'Start') {
      this.renderTokensSequentially();
      this.showTip = false;
      this.isTokenIntervalReadonly = true;
    }
    else {
      this.showTip = true;
      this.isTokenIntervalReadonly = false;
    }

    this.pausePlayToken = this.pausePlayToken === 'Pause' ? 'Start' : 'Pause';
  }

  CheckForBingo() {

    if (!this.newGameStarted) {
      return;
    }
    this.BingoFinalCheck(true);
  }

  FoundWord(id: any): void {

    if (!this.newGameStarted) {
      return;
    }

    if (this.userFoundCards.includes(id)) {
      const index = this.userFoundCards.indexOf(id);
      this.userFoundCards.splice(index, 1);
    }
    else {
      this.userFoundCards.push(id);
    }

    this.BingoFinalCheck(false);

  }

  OpenBingoResultComponent(): void {

    this.dialog.open(BingoResultComponent, {
      width: '800px',
      height: 'auto',
      autoFocus: false,
      data: {
        userName: this.userName
      }
    });
  }

  @HostListener('window:unload', ['$event'])
  unloadHandler() {

    if (!this.newGameStarted) {
      return;
    }

    if (!this.isCacheDataChecked) {
      return;
    }

    this.StoreCardsLocalStorage('userFoundCards', this.userFoundCards);
    this.StoreCardsLocalStorage('displayedTokens', this.displayedTokens);
    this.StoreCardsLocalStorage('tokenInterval', this.tokenInterval);
    this.StoreCardsLocalStorage('currentTokenNumber', this.currentTokenNumber);
    this.StoreCardsLocalStorage('userName', this.userName);

  }

  async openDialog(): Promise<any> {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: { name: this.userName, Message: "A game is already in progress, do you still want to create new game?" }
    });

    await dialogRef.afterClosed().toPromise().then(result => {
      this.confirmResult = result;
    });

  }

  private SetLocalStorage() {

    this.StoreCardsLocalStorage('firstRowCard', this.firstRowCard);
    this.StoreCardsLocalStorage('secondRowCard', this.secondRowCard);
    this.StoreCardsLocalStorage('thirdRowCard', this.thirdRowCard);
    this.StoreCardsLocalStorage('fourthRowCard', this.fourthRowCard);
    this.StoreCardsLocalStorage('fifthRowCard', this.fifthRowCard);
    this.StoreCardsLocalStorage('diagonalFirstResult', this.diagonalFirstResult);
    this.StoreCardsLocalStorage('diagonalSecondResult', this.diagonalSecondResult);
    this.StoreCardsLocalStorage('userName', this.userName);
    this.StoreCardsLocalStorage('newGameStarted', this.newGameStarted);
    this.StoreCardsLocalStorage('DateCreated', new Date().toString());
    this.StoreCardsLocalStorage('isCacheDataChecked', this.isCacheDataChecked);
  }

  private GetLocalStorage(): boolean {

    let firstRowCardTemp = this.GetDataFromLocalStorage('firstRowCard');
    if (firstRowCardTemp) {
      this.firstRowCard = firstRowCardTemp;
    }
    else {
      return false;
    }

    let secondRowCardTemp = this.GetDataFromLocalStorage('secondRowCard')
    if (secondRowCardTemp) {
      this.secondRowCard = secondRowCardTemp
    }
    else {
      return false;
    }

    let thirdRowCardTemp = this.GetDataFromLocalStorage('thirdRowCard');
    if (thirdRowCardTemp) {
      this.thirdRowCard = thirdRowCardTemp;
    }
    else {
      return false;
    }

    let fourthRowCardTemp = this.GetDataFromLocalStorage('fourthRowCard');
    if (fourthRowCardTemp) {
      this.fourthRowCard = fourthRowCardTemp;
    }
    else {
      return false;
    }

    let fifthRowCardTemp = this.GetDataFromLocalStorage('fifthRowCard');
    if (fifthRowCardTemp) {
      this.fifthRowCard = fifthRowCardTemp;
    }
    else {
      return false;
    }

    let diagonalFirstResultTemp = this.GetDataFromLocalStorage('diagonalFirstResult');
    if (diagonalFirstResultTemp) {
      this.diagonalFirstResult = diagonalFirstResultTemp;
    }
    else {
      return false;
    }

    let diagonalSecondResultTemp = this.GetDataFromLocalStorage('diagonalSecondResult');
    if (diagonalSecondResultTemp) {
      this.diagonalSecondResult = diagonalSecondResultTemp;
    }
    else {
      return false;
    }

    this.newGameStarted = this.GetDataFromLocalStorage('newGameStarted');
    if (!this.newGameStarted) {
      return false;
    }

    let userFoundCardsTemp = this.GetDataFromLocalStorage('userFoundCards');
    if (userFoundCardsTemp) {
      this.userFoundCards = userFoundCardsTemp;
    }
    else {
      return false;
    }

    let displayedTokensTemp = this.GetDataFromLocalStorage('displayedTokens');
    if (displayedTokensTemp) {
      this.displayedTokens = displayedTokensTemp;
    }
    else {
      return false;
    }

    this.currentTokenNumber = this.GetDataFromLocalStorage('currentTokenNumber');
    if (!this.currentTokenNumber) {
      return false;
    }

    let userNameTemp = this.GetDataFromLocalStorage('userName');
    if (!userNameTemp) {
      return false;
    }
    else {
      this.userName = userNameTemp;
    }

    let tokenIntervalTemp = this.GetDataFromLocalStorage('tokenInterval');
    if (!tokenIntervalTemp) {
      return false;
    } else {
      this.tokenInterval = tokenIntervalTemp;
    }

    let isCacheDataCheckedTemp = this.GetDataFromLocalStorage('isCacheDataChecked');
    if (!isCacheDataCheckedTemp) {
      this.isCacheDataChecked = isCacheDataCheckedTemp;
      return false;
    } else {
      this.isCacheDataChecked = isCacheDataCheckedTemp;
    }

    return true;

  }

  private StoreCardsLocalStorage(key: string, value: any) {

    localStorage.setItem(key, JSON.stringify(value));
  }

  private GetDataFromLocalStorage(key: string): any {

    let retrievedData = localStorage.getItem(key);
    if (retrievedData) {
      return JSON.parse(retrievedData);
    }
  }

  private renderTokensSequentially() {

    if (this.tokenInterval === null || this.tokenInterval <= 0) {
      this.invalidTimeInterval = 'Invalid time interval, provide a valid time value to continue';
      return;
    }

    const interval = +this.tokenInterval * 1000;
    this.invalidTimeInterval = '';
    let length = this.bingoTokensSource.length - 1;

    this.intervalId = setInterval(() => {
      if (this.currentTokenNumber < length) {
        this.tokenToRender = this.bingoTokensSource[this.currentTokenNumber].card;
        this.displayedTokens.push(this.tokenToRender);
        this.currentTokenNumber++;
      } else {
        delete this.tokenToRender;
        clearInterval(this.intervalId);
      }
    }, interval);
  }

  private BingoFinalCheck(checkBingoButtonClick: boolean) {

    let userDuplicate = false;
    this.userFoundCards.forEach(word => {
      if (!userDuplicate) {
        if (!this.displayedTokens.includes(word)) {
          if (word !== 'NLove') {
            userDuplicate = true;
          }
        }
      }
    });

    //TODO: remove the ! below
    if (userDuplicate && this.userFoundCards.length > 0) {
      this.deSelectMessage = 'Please un-select the cards that were not in the Generated List!';
      return;
    }
    else {
      this.deSelectMessage = '';
    }

    if (this.userFoundCards.length < 5) {
      return;
    }

    if (this.BingoDataCheck(this.userFoundCards, this.firstRowCard)) {
      this.OpenBingoResultComponent();
      this.UnsubscribeTokens(checkBingoButtonClick);
    } else if (this.BingoDataCheck(this.userFoundCards, this.secondRowCard)) {
      this.OpenBingoResultComponent();
      this.UnsubscribeTokens(checkBingoButtonClick);
    }
    else if (this.BingoDataCheck(this.userFoundCards, this.thirdRowCard)) {
      this.OpenBingoResultComponent();
      this.UnsubscribeTokens(checkBingoButtonClick);
    }
    else if (this.BingoDataCheck(this.userFoundCards, this.fourthRowCard)) {
      this.OpenBingoResultComponent();
      this.UnsubscribeTokens(checkBingoButtonClick);
    }
    else if (this.BingoDataCheck(this.userFoundCards, this.fifthRowCard)) {
      this.OpenBingoResultComponent();
      this.UnsubscribeTokens(checkBingoButtonClick);
    }
    else if (this.BingoDataCheck(this.userFoundCards, this.diagonalFirstResult)) {
      this.OpenBingoResultComponent();
      this.UnsubscribeTokens(checkBingoButtonClick);
    }
    else if (this.BingoDataCheck(this.userFoundCards, this.diagonalSecondResult)) {
      this.OpenBingoResultComponent();
      this.UnsubscribeTokens(checkBingoButtonClick);
    }
  }

  private BingoDataCheck(userFoundArray: string[], resultRowArray: string[]): boolean {

    let bingoResultArray: string[] = [];
    userFoundArray.forEach(element => {
      if (resultRowArray.includes(element)) {
        bingoResultArray.push(element);
      }
    });

    return this.BingoDataCompare(resultRowArray, bingoResultArray);
  }

  private CustomBingoSort(sortArray: string[]): string[] {

    const alphabet = 'BINGO'.split('');

    sortArray
      .sort((a, b) => {
        return alphabet.indexOf(a.substring(0, 1)) - alphabet.indexOf(b.substring(0, 1))
      })
      .join('');

    return sortArray;

  }

  private BingoDataDuplicated(firstArray: string[], secondArray: string[]): boolean {

    for (var i = 0; i < firstArray.length; i++) {
      if (firstArray[i] === secondArray[i]) {
        return true;
      }
    }
    return false;
  }

  private BingoDataCompare(bingoResultArray: string[], userInputArray: string[]): boolean {

    let userInputArraySorted = this.CustomBingoSort(userInputArray);

    let bingoExists: string[] = [];
    for (var i = 0; i < bingoResultArray.length; i++) {
      if (bingoResultArray[i] === userInputArraySorted[i]) {
        bingoExists.push(userInputArraySorted[i]);
      }
    }

    return (bingoExists.length === bingoResultArray.length && bingoExists.length === 5);

  }

  private SetBingoData() {

    const bingo = ["B", "I", "N", "G", "O"];

    for (let row = 0; row < bingo.length; row++) {
      this.firstRowCard.push(`${bingo[row]}${(Math.floor(Math.random() * 75) + 1).toString()}`);
      this.secondRowCard.push(`${bingo[row]}${(Math.floor(Math.random() * 75) + 1).toString()}`);
      if (row === 2) {
        this.thirdRowCard.push(`${bingo[row]}Love`);
      } else {
        this.thirdRowCard.push(`${bingo[row]}${(Math.floor(Math.random() * 75) + 1).toString()}`);
      }
      this.fourthRowCard.push(`${bingo[row]}${(Math.floor(Math.random() * 75) + 1).toString()}`);
      this.fifthRowCard.push(`${bingo[row]}${(Math.floor(Math.random() * 75) + 1).toString()}`);
    }
  }

}
