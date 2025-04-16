package com.example.webgiatui.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class SpringSecurity {

        public SpringSecurity() {
                super(); // Explicitly call Object constructor
        }

        // Inject the UserDetailsService bean to use for authentication
        @Autowired
        private UserDetailsService userDetailsService;

        @Bean
        public static PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http.csrf().disable()
                                .authorizeHttpRequests((authorize) -> authorize
                                                // Allow all static resources
                                                .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
                                                // Allow public pages
                                                .requestMatchers("/", "/login", "/register", "/register/save", "/booking", "/profile").permitAll()
                                                // Allow API endpoints for authentication, orders, and profile during development
                                                .requestMatchers("/api/auth/**", "/api/orders/**", "/api/booking/**", "/api/profile/**").permitAll()
                                                // Admin pages
                                                .requestMatchers("/admin/**", "/admin-dashboard", "/dashboard").hasRole("ADMIN")
                                                // Require authentication for other URLs
                                                .anyRequest().authenticated())
                                .formLogin(
                                                form -> form
                                                                .loginPage("/login")
                                                                .loginProcessingUrl("/login")
                                                                .usernameParameter("username")
                                                                .passwordParameter("password")
                                                                .defaultSuccessUrl("/")
                                                                .permitAll())
                                .rememberMe(
                                                rememberMe -> rememberMe
                                                                .key("uniqueAndSecretKey")
                                                                .tokenValiditySeconds(86400) // 1 day
                                                                .rememberMeParameter("remember-me"))
                                .logout(
                                                logout -> logout
                                                                .logoutRequestMatcher(
                                                                                new AntPathRequestMatcher("/logout"))
                                                                .logoutSuccessUrl("/login?logout")
                                                                .permitAll());
                return http.build();
        }

        @Autowired
        public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
                auth
                                .userDetailsService(userDetailsService)
                                .passwordEncoder(passwordEncoder());
        }

        @Bean
        public AuthenticationManager authenticationManager(
                AuthenticationConfiguration authenticationConfiguration) throws Exception {
                return authenticationConfiguration.getAuthenticationManager();
        }
}
