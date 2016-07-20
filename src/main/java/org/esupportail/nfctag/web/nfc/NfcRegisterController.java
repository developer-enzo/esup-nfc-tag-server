package org.esupportail.nfctag.web.nfc;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import javax.annotation.Resource;
import javax.transaction.Transactional;

import org.esupportail.nfctag.domain.AppLocation;
import org.esupportail.nfctag.domain.Application;
import org.esupportail.nfctag.domain.Device;
import org.esupportail.nfctag.exceptions.EsupNfcTagException;
import org.esupportail.nfctag.service.ApplicationsService;
import org.esupportail.nfctag.service.VersionApkService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RequestMapping("/nfc")
@Controller
@Transactional
public class NfcRegisterController {

	private final Logger log = LoggerFactory.getLogger(getClass());

	@Resource
	private VersionApkService versionApkService;
	
	@Autowired
	private ApplicationsService applicationsService;

	@RequestMapping("/locations")
	public String selectedLocationForm(
			@RequestParam(required = true) String imei, 
			@RequestParam(required = true) String macAddress,
			Model uiModel) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String eppn = auth.getName();
		log.info(eppn + "access to /nfc/locations");

		try {
			List<AppLocation> appLocations = applicationsService.getAppsLocations4Eppn(eppn);
			if (appLocations.isEmpty()) {
				log.info(eppn + " don't have location to manage");
				throw new AccessDeniedException(eppn + " don't have location to manage");
			}
			uiModel.addAttribute("numeroId", "?");
			uiModel.addAttribute("macAddress", macAddress);
			uiModel.addAttribute("imei", imei);
			uiModel.addAttribute("appLocations", appLocations);
			uiModel.addAttribute("apkVersion", versionApkService.getApkVersion());
		} catch (EmptyResultDataAccessException ex) {
			log.info(eppn + " is not manager");
			throw new AccessDeniedException(eppn + " is not manager");
		} catch (EsupNfcTagException e) {
			log.error("can't get locations", e);
		}
		return "nfc";
	}

	@RequestMapping(value = "/register")
	public String nfcRegister(
			@RequestHeader(value="User-Agent") String userAgent, 
			@RequestParam(required = true) String location, 
			@RequestParam(required = true) Long applicationId,
			@RequestParam(required = true) String imei,
			@RequestParam(required = true) String macAddress, Model uiModel) throws IOException, EsupNfcTagException {
		
		Application application = Application.findApplication(applicationId);

		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String eppnInit = auth.getName();
		
		// check right access ...
		List<AppLocation> appLocations = applicationsService.getAppsLocations4Eppn(eppnInit);
		Optional<AppLocation> appLocation = appLocations.stream().filter(appLoc -> appLoc.getApplication().getId().equals(applicationId)).findAny();
		if(!appLocation.isPresent() || !appLocation.get().getLocations().contains(location)) {
			log.warn(eppnInit + " can not register in this location " + location);
			throw new AccessDeniedException(eppnInit + " can not register in this location " + location);
		}
		
		String numeroId;
		
		if (Device.countFindDevicesByLocationAndEppnInitAndMacAddressEquals(location, eppnInit, macAddress)==0) {
			Long numeroRandom = Math.abs(new Random().nextLong());
			numeroId = numeroRandom.toString();
			Device device = new Device();
			device.setNumeroId(numeroId);
			device.setEppnInit(eppnInit);
			device.setLocation(location);
			device.setApplication(application);
			device.setImei(imei);
			device.setMacAddress(macAddress);
			device.setUserAgent(userAgent);
			device.persist();
		} else {
			Device tel = Device.findDevicesByLocationAndEppnInitAndMacAddressEquals(location, eppnInit, macAddress)
					.getSingleResult();
			numeroId = tel.getNumeroId();
		}
		uiModel.addAttribute("imei", imei);
		uiModel.addAttribute("macAddress", macAddress);
		uiModel.addAttribute("numeroId", numeroId);
		uiModel.addAttribute("apkVersion", versionApkService.getApkVersion());
		return "nfc/register";
	}

	@RequestMapping(value = "/unregister")
	public String nfcUnRegister(@RequestParam(required = true) String numeroId, 
			@RequestParam(required = true) String imei, 
			@RequestParam(required = true) String macAddress,
			Model uiModel) throws IOException {
		uiModel.addAttribute("imei", imei);
		uiModel.addAttribute("macAddress", macAddress);
		uiModel.addAttribute("numeroId", numeroId);
		uiModel.addAttribute("apkVersion", versionApkService.getApkVersion());
		/*
		 * if(Device.countFindTelephoneAuthsByNumeroIdEquals(numeroId)>0)
		 * { Device telephoneAuth =
		 * Device.findTelephoneAuthsByNumeroIdEquals(numeroId).
		 * getSingleResult(); telephoneAuth.remove(); telephoneAuth.clear(); }
		 */
		return "nfc/unregister";
	}

}
