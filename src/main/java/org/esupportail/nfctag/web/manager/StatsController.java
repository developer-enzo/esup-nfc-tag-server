/**
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
package org.esupportail.nfctag.web.manager;

import java.util.Calendar;
import java.util.Date;

import javax.annotation.Resource;

import org.esupportail.nfctag.domain.Device;
import org.esupportail.nfctag.domain.TagLog;
import org.esupportail.nfctag.service.StatsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@RequestMapping("/manager/stats")
@Controller
public class StatsController {

	protected final Logger log = LoggerFactory.getLogger(this.getClass());
	
	@Resource
	StatsService statsService;	
	
	@RequestMapping()
	public String index(Model uiModel) {
		
		Calendar cal = Calendar.getInstance(); // creates calendar
	    cal.setTime(new Date()); // sets calendar time/date
	    cal.add(Calendar.HOUR_OF_DAY, -1); // adds one hour
	    cal.getTime();
		
	    Long nbTagLastHour = TagLog.countFindTagLogsByAuthDateBetween(cal.getTime(), new Date());
	    
	    uiModel.addAttribute("nbDevice", Device.countDevices());
	    uiModel.addAttribute("nbTagLastHour", nbTagLastHour);
	    
		return "manager/stats";
	}
	
	
	@RequestMapping(value="/chartJson", headers = "Accept=application/json; charset=utf-8")
	@ResponseBody 
	public String getStats(@RequestParam(required = false, value="model") StatsModel model, @RequestParam(required = false, value="annee") String annee) {
		if(annee==null) annee = "2016";
		
		String json = "Aucune statistique à récupérer";
		try {
			switch (model) {
			case nbTagLastHour :
				json = statsService.getnbTagLastHour(annee);			
				break;
			case numberDeviceByUserAgent :
				json = statsService.getNumberDeviceByUserAgent(annee);			
				break;
			case numberTagByLocation :
				json = statsService.getNumberTagByLocation(annee);				
				break;
			case numberTagByWeek :
				json = statsService.getNumberTagByWeek(annee);				
				break;
			default:
				break;
			}
			
		} catch (Exception e) {
			log.warn("Impossible de récupérer les statistiques", e);
		}
    	return json;
	}
	
	public enum StatsModel{
		numberDeviceByUserAgent, numberTagByLocation, numberTagByWeek, nbTagLastHour
	}
	
}
