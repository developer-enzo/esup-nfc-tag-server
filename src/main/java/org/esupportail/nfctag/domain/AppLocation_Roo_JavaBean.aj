// WARNING: DO NOT EDIT THIS FILE. THIS FILE IS MANAGED BY SPRING ROO.
// You may push code into the target .java compilation unit if you wish to edit any member(s).

package org.esupportail.nfctag.domain;

import java.util.List;
import org.esupportail.nfctag.domain.AppLocation;
import org.esupportail.nfctag.domain.Application;

privileged aspect AppLocation_Roo_JavaBean {
    
    public Application AppLocation.getApplication() {
        return this.application;
    }
    
    public void AppLocation.setApplication(Application application) {
        this.application = application;
    }
    
    public List<String> AppLocation.getLocations() {
        return this.locations;
    }
    
    public void AppLocation.setLocations(List<String> locations) {
        this.locations = locations;
    }
    
    public Boolean AppLocation.getAvailable() {
        return this.available;
    }
    
    public void AppLocation.setAvailable(Boolean available) {
        this.available = available;
    }
    
}