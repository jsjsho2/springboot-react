package com.raon.approval.config;

import com.raon.approval.data.FixVariable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ReadYaml {

    @Value("${spring.datasource.driver-class-name}")
    public String dbDriver;

    @Value("${spring.datasource.url}")
    public String dbUrl;

    @Value("${spring.datasource.username}")
    public String dbId;

    @Value("${spring.datasource.password}")
    public String dbPw;

    @Value("${sso-engine.key}")
    public String ssoKey;

    @Value("${sso-engine.ip}")
    public String ssoIp;

    @Value("${sso-engine.port}")
    public int ssoPort;

    @Value("${config.profileId}")
    public String profileId;

    public void setValue() {
        FixVariable.setDriver(dbDriver);
        FixVariable.setUrl(dbUrl);
        FixVariable.setId(dbId);
        FixVariable.setPw(dbPw);
        FixVariable.setSsoKey(ssoKey);
        FixVariable.setSsoIp(ssoIp);
        FixVariable.setSsoPort(ssoPort);
        FixVariable.setProfileId(profileId);
    }
}
