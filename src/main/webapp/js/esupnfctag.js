/*
 * Licensed to ESUP-Portail under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.
 *
 * ESUP-Portail licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

$(document).ready(function() {
	// Hack to test with a simple browser (without Android phone)
	window.getEsupNfcStorage = function() {
		try {
			AndroidLocalStorage.setItem("dummy", "dummy");
			return AndroidLocalStorage;
		} catch(e) {
			if (e instanceof ReferenceError) {
				return sessionStorage;
			} else {
			    throw e; 
			}
		}
	}

	window.androidLogout = function(urldisconnect) {
		if(confirm(msg)) {
			$.ajax({
				url : urldisconnect,
				context: this,
				success : function() {
					Android.disconnect();
				},
				cache : false
				});
			return true;
		}
		return false;
	}
	
	/* MUSTACHE TEMPLATES */
	if(typeof numeroId != 'undefined'){
		if(numeroId!=""){
			$.Mustache.add('leoauth-template', '{{#leoauths}} \
					<tr id="row_{{id}}"> \
						<td class="td-live-text">{{firstname}} {{lastname}} <br/> {{authDateString}}<br/></td> \
						<td class="td-live-img"><div id="status_{{id}}">{{status}}</div></td> \
					</tr>{{/leoauths}}');
	
	
	
		}else{
			$.Mustache.add('leoauth-template', '{{#leoauths}} \
					<tr id="row_{{id}}"> \
						<td class="td-live-text">{{firstname}} {{lastname}} <br/> {{authDateString}}<br/></td> \
						<td class="td-live-text">{{location}}<br/></td> \
						<td class="td-live-img"><div id="status_{{id}}">{{status}}</div></td> \
					</tr>{{/leoauths}}');
		}
	}
	$.Mustache.add('validate-template', '{{#leoauths}} \
		<div id="validateModal" class="modal fade" role="dialog" style="background-color: rgba(115, 210, 22, 0.5);"> \
			<div class="modal-dialog" > \
				<div class="modal-content"> \
					<!-- dialog body --> \
					<div class="modal-body" style="text-align: center"> \
						<h1>Confirmer le badgeage de {{firstname}} {{lastname}}</h1> \
						<button id="validateButton_{{id}}" type="button" data-dismiss="modal" class="btn btn-success btn-lg">Valider</button> \
						<button id="cancelButton_{{id}}" type="button" data-dismiss="modal" class="btn btn-danger btn-lg">Annuler</button> \
					</div> \
				</div> \
			</div> \
		</div>{{/leoauths}}');
	
	$.Mustache.add('error-template', '{{#tagerrors}} \
			<div id="errorModal" class="modal fade" role="dialog" style="background-color: rgba(255, 99, 99, 0.5);"> \
				<div class="modal-dialog" > \
					<div class="modal-content"> \
						<!-- dialog body --> \
						<div class="modal-body" style="text-align: center"> \
							<h1>{{exception.message}}</h1> \
							<button id="cancelButton" type="button" data-dismiss="modal" class="btn btn-danger btn-lg">Fermer</button> \
						</div> \
					</div> \
				</div> \
			</div>{{/tagerrors}}');
	
	/* ESUP LONG POLL PROTOTYPE */
	
	var esupLongPoll = {
			debug : false,
			run : false,
			timer : undefined,
			lastAuthDate : 0,
			list : undefined
	};
	esupLongPoll.start = function() {
		if (!this.run) {
			this.run = true;
			this.timer = this.poll();
		}
	}
	esupLongPoll.clear = function() {
		$('#lastleoauth').html('');
	}
	esupLongPoll.stop = function() {
		if (this.run && this.timer != null) {
			clearTimeout(this.timer);
		}
		run = false;		
	}
	esupLongPoll.poll = function() {
		if (this.timer != null) {
			clearTimeout(this.timer);
		}
		return $(this).delay(1000).load(); 
		//return setTimeout(this.load, 1000);
	}
	
	

	/* LIVE LONG POLL */
	
	var liveLongPoll = Object.create(esupLongPoll);

	liveLongPoll.load = function() {
		if(this.debug) {
			$('#status').text("Getting Taglogs...")
		}
		if (this.run) {
			$.ajax({
				url : "/live/taglogs?authDateTimestamp=" + this.lastAuthDate + "&numeroId=" + numeroId,
				context: this,
				success : function(message) {
					if (this.debug) {
						$('#debug').text(JSON.stringify(message))
					}
					if (message && message.length) {
						var newLastleoauth = $('#lastleoauth').mustache('leoauth-template', {'leoauths' : message}, { method: 'prepend' });
						var newleoauth = newLastleoauth.children('#newLog').fadeIn('slow').slice();	
						if(this.lastAuthDate==0) {
							newleoauth.attr("class", "oldLog");
							if(message[0].status == "none" && message.length>1){message[0].status = "cancel"}
						}
						var newValidateModal = $('#validate').mustache('validate-template', {'leoauths' : message}, { method: 'prepend' });
						if(message[0].status == "none"){
							var validateModal = $('#validateModal').appendTo("body").modal({backdrop: 'static', keyboard: false, show: true});						
							validateModal.on('hidden.bs.modal', function () {
								getEsupNfcStorage().setItem("readyToScan", "ok");
							});
							$('#validateButton_'+message[0].id).on('click', function(event) {
								$.get( "/nfc-ws/validate?id="+message[0].id, function( data ) {
									if(data==true){
										$('#status_'+message[0].id).html('<span class="icon-tag glyphicon glyphicon-ok-circle text-success"><!-- --></span>');
										$('#row_'+message[0].id).toggleClass("success");
									}
								});
							});
							$('#cancelButton_'+message[0].id).on('click', function(event) {
								$.get( "/nfc-ws/cancel?id="+message[0].id, function( data ) {
									if(data==true){
										$('#status_'+message[0].id).html('<span class="icon-tag glyphicon glyphicon-remove-circle text-danger"><!-- --></span>');
										$('#row_'+message[0].id).toggleClass("danger");
									}
								});
								
							});
						}
						this.lastAuthDate = message[0].authDate;
						setTimeout(function(){
							newleoauth.attr("class", "oldLog");
						}, 2000);
						var oldleoauth = $('#lastleoauth tr:gt(9)').slice();
						setTimeout(function(){
							oldleoauth.hide('slow', function(){ oldleoauth.remove(); });
						}, 5000);
						try{
							if(validateAuthWoConfirmation=="true"){
								getEsupNfcStorage().setItem("readyToScan", "ok");
							}
						}catch(e){
							if(this.debug) $('#status').text(e);
						}
					}
					$("div[id^=status]").each(function(){
						if($(this).text()=="valid"){$(this).html('<span class="icon-tag glyphicon glyphicon-ok-circle text-success"><!-- --></span>')}
						if($(this).text()=="cancel"){$(this).html('<span class="icon-tag glyphicon glyphicon-remove-circle text-danger"><!-- --></span>')}					
						if($(this).text()=="none"){$(this).html('<span class="icon-tag glyphicon glyphicon-ban-circle text-warning"><!-- --></span>')}
					});
					this.timer = this.poll();
				},
				error : function() {
					if(this.debug) $('#status').text("Failed to get tagLogs");
					setTimeout(function(){
						liveLongPoll.timer = liveLongPoll.poll();
					}, 2000);
				},
				cache : false
			})
			$('#status').text("");
		} else {
			if(this.debug) $('#status').text("Stopped");
		}
	}
	
	
	$(function() {
		$.ajaxSetup({cache:false});
		if($('#lastleoauth').length) {
	        try{
	            getEsupNfcStorage().setItem("serviceUrl", serviceUrl);
	            getEsupNfcStorage().setItem("authType", authType);
	            getEsupNfcStorage().setItem("readyToScan", "ok");
	        }catch(e){
	        	if(this.debug) document.getElementById("debug").innerHTML = e;
	        }
			liveLongPoll.start();
		}
	});
	
	
	/* ERRORS LONG POLL */
	
	var errorsLongPool = Object.create(esupLongPoll);
	
	errorsLongPool.load = function() {

		if(this.run) {
			
			$.ajax({
				url : "/live/tagerror?errorDateTimestamp=" + this.lastAuthDate +"&numeroId=" + numeroId,
				context: this,
				success : function(message) {
					if (this.debug) {
						$('#debug').text(JSON.stringify(message))
					}
					if (message && message.length) {
						var newErrorModal = $('#error').mustache('error-template', {'tagerrors' : message[0]}, { method: 'prepend' });
						var errorModal = $('#errorModal').appendTo("body").modal({backdrop: 'static', keyboard: false, show: true});
						errorModal.on('hidden.bs.modal', function () {
							getEsupNfcStorage().setItem("readyToScan", "ok");
						});
						this.lastAuthDate = message[0].errorDate;
					}
					this.timer = this.poll();			
				},
				error : function() {
					if(this.debug) $('#status').text("Failed to get errors");
					setTimeout(function(){
						errorsLongPool.timer = errorsLongPool.poll();
					}, 2000);
				},
				cache : false
			});
		}
	}
	
	$(function() {
		$.ajaxSetup({cache:false});
		if($('#lastleoauth').length) {
			errorsLongPool.start();
		}
	});
	
});

$(document).ready(function(){
	var string = document.location.href;
	substring = "stats";
	if(string.indexOf(substring) > -1){
	Chart.defaults.global.responsive= true;
	Chart.defaults.global.maintainAspectRatio=false;
	Chart.defaults.global.responsiveAnimationDuration=0;
	Chart.defaults.global.legend.labels.fontFamily = "Arial";
	Chart.defaults.global.legend.labels.boxWidth = 20;
	Chart.defaults.global.legend.position= "bottom";
	Chart.defaults.global.title.fontFamily = "Arial";
	Chart.defaults.global.title.fontSize = 14;
	Chart.defaults.global.title.display= false;
	Chart.defaults.global.elements.point.radius=7;
	Chart.defaults.global.elements.point.backgroundColor= "#fff";
	Chart.defaults.global.elements.point.borderColor= "rgba(0,0,0,1)";
	Chart.defaults.global.elements.line.tension=0.2;
	Chart.defaults.global.elements.line.backgroundColor= "rgba(220,220,220,0.5)";
	Chart.defaults.global.elements.line.borderColor= "rgba(100,100,100,0.7)";
	
	$.ajax({
        url: "chartJson?model=numberDeviceByUserAgent&annee="+annee,
        type: 'GET',
        dataType : 'json',
        success : function(data) {
        	var ctx = document.getElementById("deviceByUserAgent");
        	var repartionComposantesChart = new Chart(ctx, {
        		type: 'doughnut',
        		data: data,
        		options: {
        			legend:{
        				display:false
        			},
            		animation:{
            			animateRotate:true,
            			animateScale:true
            		},
                     title: {
                    	 text: "deviceByUserAgent",
                     },
                     tooltips: {
                         callbacks: {
                             label:function(item, data){
                            	 console.log(data);
                            	 var sum = 0;
                            	 data.datasets[0].data.forEach(
                            	     function addNumber(value) { sum += parseInt(value); }
                            	 );
                            	 pourcent = data.datasets[0].data[item.index] / sum * 100;
                            	 return data.labels[item.index]+" : "+data.datasets[0].data[item.index] + " - "+ Math.round(pourcent*100)/100 +"%";
                             }
                         
                         }
                     }
                }
        	});
        	
        }
	});

	$.ajax({
        url: "chartJson?model=numberTagByLocation&annee="+annee,
        type: 'GET',
        dataType : 'json',
        success : function(data) {
        	var ctx = document.getElementById("tagsByLocation");
        	var repartionComposantesChart = new Chart(ctx, {
        		type: 'doughnut',
        		data: data,
        		animation:{
        			animateRotate:true,
        			animateScale:true
        		},
        		options: {
                     title: {
                    	 text: "tagsByLocation"
                     },
        		tooltips: {
                    callbacks: {
                        label:function(item, data){
                       	 console.log(data);
                       	 var sum = 0;
                       	 data.datasets[0].data.forEach(
                       	     function addNumber(value) { sum += parseInt(value); }
                       	 );
                       	 pourcent = data.datasets[0].data[item.index] / sum * 100;
                       	 return data.labels[item.index]+" : "+data.datasets[0].data[item.index] + " - "+ Math.round(pourcent*100)/100 +"%";
                        }
                    
                    }
                }
                },
                
        	});
        }
	
	});

	
	
	$.ajax({
        url: "chartJson?model=nbTagLastHour&annee="+annee,
        type: 'GET',
        dataType : 'json',
        success : function(data) {
        	var ctx = document.getElementById("nbTagLastHour").getContext("2d");
        	var repartionComposantesChart = new Chart(ctx, {
        		type: 'doughnut',
        		data: data,
        		animation:{
        			animateRotate:true,
        			animateScale:true
        		},
        		options: {
                     title: {
                    	 text: "nbTagLastHour"
                     },
                },
                
        	});
        }
	
	});
	
	$.ajax({
		url: "chartJson?model=numberTagByWeek&annee="+annee,
        type: 'GET',
        dataType : 'json',
        success : function(data) {
        	var ctx = document.getElementById("tagsByWeek").getContext("2d");
        	var repartionComposantesChart = new Chart(ctx, {
        		type: 'line',
        		data: data,
        		options: {
                     title: {
                    	 text: "tagsByWeek",
                     },
                }
        	});
        }
	});
	
	
	}
});

Chart.pluginService.register({
	  beforeRender: function (chart) {
	    if (chart.config.options.showAllTooltips) {
	        // create an array of tooltips
	        // we can't use the chart tooltip because there is only one tooltip per chart
	        chart.pluginTooltips = [];
	        chart.config.data.datasets.forEach(function (dataset, i) {
	            chart.getDatasetMeta(i).data.forEach(function (sector, j) {
	                chart.pluginTooltips.push(new Chart.Tooltip({
	                    _chart: chart.chart,
	                    _chartInstance: chart,
	                    _data: chart.data,
	                    _options: chart.options.tooltips,
	                    _active: [sector]
	                }, chart));
	            });
	        });

	        // turn off normal tooltips
	        chart.options.tooltips.enabled = false;
	    }
	    
	},
	  afterDraw: function (chart, easing) {
	    if (chart.config.options.showAllTooltips) {
	        // we don't want the permanent tooltips to animate, so don't do anything till the animation runs atleast once
	        if (!chart.allTooltipsOnce) {
	            if (easing !== 1)
	                return;
	            chart.allTooltipsOnce = true;
	        }

	        // turn on tooltips
	        chart.options.tooltips.enabled = true;
	        Chart.helpers.each(chart.pluginTooltips, function (tooltip) {
	            tooltip.initialize();
	            tooltip.update();
	            // we don't actually need this since we are not animating tooltips
	            tooltip.pivot();
	            tooltip.transition(easing).draw();
	        });
	        chart.options.tooltips.enabled = false;
	    }
	  }
	});

$(document).ready(function() {
	/* USUAL FORM RULES */
	
	$(function(){
		
		$('#application').validate({
			rules : {
				name : {
					required : true
				},
				nfcConfig : {
					required : true
				},
				appliExt : {
					required : true
				},
				tagIdCheck : {
					required : true
				}
			}
		});
		
		$('#device').validate({
			rules : {
				numeroId : {
					required : true
				},
				eppnInit : {
					required : true
				},
				imei : {
					required : true
				},
				macAddress : {
					required : true
				},
				userAgent : {
					required : true
				},
				application : {
					required : true
				},
				location : {
					required : true
				}
			}
		});
	});
	
	$(function(){
		
		$('[id^=_application_id]').each(function() {
			$(this).click(function(){
				checkLocations();
			})
		});
		$("#eppnInit").focusout(function(){
			checkLocations();
		});
		$("#location").focusin(function(){
			checkLocations();
		});	

		
		function checkLocations(){
			$('#location').val('');
			$('#location').find('option').remove().end();
			var eppn = $('#eppnInit').val();			
			var idApp;
			$("input[id^=_application_id]:checked").each(function() {
		        idApp = $(this).val();
		    });
			console.error(idApp);
			console.error(eppn);
			
			if(eppn!=null && idApp!=null){
				console.error(idApp);
				var url = '/manager/devices/locationsJson?eppn='+eppn+'&applicationId='+idApp;			
				console.error(url);
				$.ajax({
				    url: url,
				    type:'GET',
				    dataType: 'json',
				    success: function( json ) {
				        $.each(json, function(i, value) {
				            $('#location').append($('<option>').text(value).attr('value', value));
				        });
				        $("#location").click();
				    }
				});
			}
		}
	});
	
});

