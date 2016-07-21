// WARNING: DO NOT EDIT THIS FILE. THIS FILE IS MANAGED BY SPRING ROO.
// You may push code into the target .java compilation unit if you wish to edit any member(s).

package org.esupportail.nfctag.domain;

import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.esupportail.nfctag.domain.NfcMessage;
import org.springframework.transaction.annotation.Transactional;

privileged aspect NfcMessage_Roo_Jpa_ActiveRecord {
    
    @PersistenceContext
    transient EntityManager NfcMessage.entityManager;
    
    public static final List<String> NfcMessage.fieldNames4OrderClauseFilter = java.util.Arrays.asList("csn", "numeroId");
    
    public static final EntityManager NfcMessage.entityManager() {
        EntityManager em = new NfcMessage().entityManager;
        if (em == null) throw new IllegalStateException("Entity manager has not been injected (is the Spring Aspects JAR configured as an AJC/AJDT aspects library?)");
        return em;
    }
    
    public static long NfcMessage.countNfcMessages() {
        return entityManager().createQuery("SELECT COUNT(o) FROM NfcMessage o", Long.class).getSingleResult();
    }
    
    public static List<NfcMessage> NfcMessage.findAllNfcMessages() {
        return entityManager().createQuery("SELECT o FROM NfcMessage o", NfcMessage.class).getResultList();
    }
    
    public static List<NfcMessage> NfcMessage.findAllNfcMessages(String sortFieldName, String sortOrder) {
        String jpaQuery = "SELECT o FROM NfcMessage o";
        if (fieldNames4OrderClauseFilter.contains(sortFieldName)) {
            jpaQuery = jpaQuery + " ORDER BY " + sortFieldName;
            if ("ASC".equalsIgnoreCase(sortOrder) || "DESC".equalsIgnoreCase(sortOrder)) {
                jpaQuery = jpaQuery + " " + sortOrder;
            }
        }
        return entityManager().createQuery(jpaQuery, NfcMessage.class).getResultList();
    }
    
    public static NfcMessage NfcMessage.findNfcMessage(Long id) {
        if (id == null) return null;
        return entityManager().find(NfcMessage.class, id);
    }
    
    public static List<NfcMessage> NfcMessage.findNfcMessageEntries(int firstResult, int maxResults) {
        return entityManager().createQuery("SELECT o FROM NfcMessage o", NfcMessage.class).setFirstResult(firstResult).setMaxResults(maxResults).getResultList();
    }
    
    public static List<NfcMessage> NfcMessage.findNfcMessageEntries(int firstResult, int maxResults, String sortFieldName, String sortOrder) {
        String jpaQuery = "SELECT o FROM NfcMessage o";
        if (fieldNames4OrderClauseFilter.contains(sortFieldName)) {
            jpaQuery = jpaQuery + " ORDER BY " + sortFieldName;
            if ("ASC".equalsIgnoreCase(sortOrder) || "DESC".equalsIgnoreCase(sortOrder)) {
                jpaQuery = jpaQuery + " " + sortOrder;
            }
        }
        return entityManager().createQuery(jpaQuery, NfcMessage.class).setFirstResult(firstResult).setMaxResults(maxResults).getResultList();
    }
    
    @Transactional
    public void NfcMessage.persist() {
        if (this.entityManager == null) this.entityManager = entityManager();
        this.entityManager.persist(this);
    }
    
    @Transactional
    public void NfcMessage.remove() {
        if (this.entityManager == null) this.entityManager = entityManager();
        if (this.entityManager.contains(this)) {
            this.entityManager.remove(this);
        } else {
            NfcMessage attached = NfcMessage.findNfcMessage(this.id);
            this.entityManager.remove(attached);
        }
    }
    
    @Transactional
    public void NfcMessage.flush() {
        if (this.entityManager == null) this.entityManager = entityManager();
        this.entityManager.flush();
    }
    
    @Transactional
    public void NfcMessage.clear() {
        if (this.entityManager == null) this.entityManager = entityManager();
        this.entityManager.clear();
    }
    
    @Transactional
    public NfcMessage NfcMessage.merge() {
        if (this.entityManager == null) this.entityManager = entityManager();
        NfcMessage merged = this.entityManager.merge(this);
        this.entityManager.flush();
        return merged;
    }
    
}