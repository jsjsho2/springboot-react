package com.raon.approval;

import com.raon.approval.common.Interceptor;
import com.raon.approval.config.ReadYaml;
import com.raon.approval.config.SetConfig;
import com.raon.approval.data.FixVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@SpringBootApplication
@EnableScheduling
public class ReactApplication extends SpringBootServletInitializer implements WebMvcConfigurer{

    @Autowired
    private Interceptor interceptor;

    ReactApplication(){}

    public static void main(String[] args) {
        SpringApplication.run(ReactApplication.class, args);
    }

    @Bean
    CommandLineRunner commandLineRunner(ReadYaml readYaml) {

        return args -> {
            readYaml.setValue();

            SetConfig setConfig = new SetConfig();
//            setConfig.batchSetting();
        };
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(interceptor);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder){
        return builder.sources(ReactApplication.class);
    }
}
