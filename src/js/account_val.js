var load_check_a='',load_check2_a='';
var wallet_elt_a;
var timeout_a=1000;
var account_v;
var STEEM_A,SBD_A;
var token_a=null;
var accountValStarted=false;
var acc_steemit,acc_busy,acc_global,acc_market;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='acc_v'&&request.order==='start'&&token_a==null)
    {
      token_a=request.token;
      acc_steemit=request.data.steemit;
      acc_busy=request.data.busy;
      acc_global=request.data.global;
      acc_market=request.data.market;
      startAccountValue();
      accountValStarted=true;
    }
    else if(request.to==='acc_v'&&request.order==='click'&&token_a===request.token){
      acc_global=request.data.global;
      acc_market=request.data.market;
      onClickA();}
    else if(request.to==='acc_v'&&request.order==='notif'&&token_a===request.token)
    {
      console.log("notif");
      if(accountValStarted)
      {
        acc_market=request.market;
        onClickA();
      }
    }
});

function startAccountValue(){
        if(acc_steemit) {
            load_check_a=/transfers/;
            load_check2_a=/transfers/;
            if(window.location.href.includes('@') && window.location.href.includes('/')){
              account_v=window.location.href.split('@')[1].split('/')[0];
              wallet_elt_a=$('.medium-4')[4];
            }
            else
              return;

        }
            else if(acc_busy)
        {
            load_check_a=/wallet/;
            load_check2_a=/transfers/;
            wallet_elt_a=$('.UserWalletSummary__value')[4];
            account_v=(window.location.href.match(load_check))?$('.Topnav__user__username').html():window.location.href.split('@')[1].split('/')[0];
        }

        if(window.location.href.match(load_check_a)||window.location.href.match(load_check2_a)){
          checkLoad();
        }
    }

  function onClickA(){
    setTimeout(function() {
      if(window.location.href!=='')
      {
        console.log(wallet_elt_a,"3");
        if(window.location.href.includes('@')){
          account_v=acc_steemit?window.location.href.split('@')[1].split('/')[0]:(window.location.href.match(load_check_a))?$('.Topnav__user__username').html():window.location.href.split('@')[1].split('/')[0];
          wallet_elt_a=acc_steemit?$('.medium-4')[4]:".UserWalletSummary__item ";
        }
      }
      if ((window.location.href.match(load_check_a)||window.location.href.match(load_check2_a)) ) {
        console.log(wallet_elt_a,"2");
        checkLoad();
      }
    },timeout_a);
  }

  function checkLoad(){


    if($(wallet_elt_a).length>0){

      createTitle();
    }
    else {
      setTimeout(checkLoad, 1000);
    }
  }

  function createTitle() {

    var title='<h5>Details</h5>';
    var real_val=document.createElement('span');
    var logo=document.createElement('img');
    logo.src=chrome.extension.getURL("src/img/logo.png");
    logo.id='logovalue';
    if(acc_steemit)
      logo.title='Real account value calculated by SteemPlus according to Bittrex price for STEEM and SBD';
    if(acc_steemit&& $('.medium-4 .dropdown-arrow').length!==0)
      real_val.style.marginRight='1em';
    real_val.className='real_value';
    real_val.append(logo);
    STEEM_A=acc_market.priceSteem;
    SBD_A=acc_market.priceSBD;
    steem.api.getAccounts([account_v], function(err, result) {
      if(err) console.log(err);
      console.log(result);
      var value=0;
      const STEEM_BALANCE=STEEM_A*parseFloat(result[0].balance.split(' ')[0]);
      const STEEM_SAVINGS=STEEM_A*+parseFloat(result[0].savings_balance.split(' ')[0]);
      const STEEM_POWER=STEEM_A*steem.formatter.vestToSteem(result[0].vesting_shares, acc_global.totalVests, acc_global.totalSteem);
      const STEEM= STEEM_BALANCE+STEEM_SAVINGS+STEEM_POWER;
      const SBD_BALANCE=SBD_A*parseFloat(result["0"].sbd_balance.split(' ')[0]);
      const SBD_SAVINGS=SBD_A*parseFloat(result[0].savings_sbd_balance.split(' ')[0]);
      const SBD=SBD_BALANCE+SBD_SAVINGS;
      const TOTAL_VALUE=SBD+STEEM;
      value=postProcess(TOTAL_VALUE);


        var pop=document.createElement('a');
        pop.style.cursor='pointer';
        pop.id='popop';

        if(acc_steemit){
          pop.innerHTML=value;
          real_val.append(pop);
          wallet_elt_a.append(real_val);
        if($('.real_value').length>1)
          $('.real_value')[0].remove();
        }
      else {
        wallet_elt_a.prepend(pop);
        $('#popop').html(logo);
        title='<h5>Total <span class="value_of">'+value+'</class></h5>';

        url=window.location.href;}

    $('#popop').attr('data-toggle','popover');
    $('#popop').attr('data-content','<h5>STEEM:  <span class="value_of">'+postProcess(STEEM)+'</span>'
      +'</h5><hr/> Balance: <span class="value_of">'+postProcess(STEEM_BALANCE)+'</span>'
      +'<br/> SP: <span class="value_of">'+postProcess(STEEM_POWER)+'</span>'
      +'<br/> Savings: <span class="value_of">'+postProcess(STEEM_SAVINGS)+'</span>'
      +'<br/><br/> <h5>SBD: <span class="value_of">'+postProcess(SBD)+'</span>'
      +'</h5><hr/> Balance: <span class="value_of">'+postProcess(SBD_BALANCE)+'</span>'
      +'<br/> Savings: <span class="value_of">'+postProcess(SBD_SAVINGS)+'</span>');
    $('#popop').attr('data-placement','bottom');
    $('#popop').attr('title',title);
    $('#popop').attr('data-html','true');
    $('#popop').attr('data-trigger','hover');
    $('[data-toggle="popover"]').popover();

    if($('.FoundationDropdownMenu__label').length > 0)
    {
      $($('.FoundationDropdownMenu__label')[1]).attr('title',getVestString(result[0].vesting_shares));

    }
    else
    {
      if($('.vests-added').length === 0)
      {
        var spanVestingShares = $('.UserWallet__balance > .column')[3];
        var newDiv = $('<div title="' + getVestString(result[0].vesting_shares) + '">' + $(spanVestingShares)[0].textContent.split('(')[0] + ($(spanVestingShares)[0].textContent.split('(')[1]==undefined?'</div>':'</div><div title="STEEM POWER delegated to/from this account">(' + $(spanVestingShares)[0].textContent.split('(')[1] + '</div>"'));
        $(spanVestingShares)[0].textContent = '';
        $(spanVestingShares).append(newDiv);
        $(newDiv).parent().eq(0).addClass('vests-added');
      }
      
    }


  });
}

function postProcess(value)
{
  value=Math.round(value*100)/100;
  value=value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return '$' +value;
}

function getVestString(vests)
{
  if(parseInt(vests)/1000000000 > 1)
    return numberWithCommas((parseInt(vests)/1000000000).toFixed(3)) + ' GVests';
  else if(parseInt(vests)/1000000 > 1)
    return numberWithCommas((parseInt(vests)/1000000).toFixed(3)) + ' MVests';
  else if(parseInt(vests)/1000)
    return numberWithCommas((parseInt(vests)/1000).toFixed(3)) + ' kVests';
  else
    return numberWithCommas(vests) + ' Vests';
}

var numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
