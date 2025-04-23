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
                                                .requestMatchers("/css/**", "/js/**", "/images/**", "/webjars/**", "/fonts/**").permitAll()
                                                // Allow all HTML pages during development
                                                .requestMatchers("/", "/index", "/login", "/register", "/register/save", 
                                                                "/booking", "/profile", "/orders", "/feedbacks", 
                                                                "/admin-dashboard", "/dashboard", "/contact", "/about", 
                                                                "/services", "/service-details", "/admin/**", "/admin-login",
                                                                "/feedback/**", "/user/**").permitAll()
                                                // Allow all API endpoints during development
                                                .requestMatchers("/api/**").permitAll()
                                                // Specific API endpoints
                                                .requestMatchers("/api/auth/**", "/api/orders/**", "/api/booking/**", 
                                                                "/api/profile/**", "/api/users/**", "/api/feedbacks/**", 
                                                                "/api/services/**").permitAll()
                                                // Require authentication for other URLs in production
                                                // For development, we'll allow all
                                                .anyRequest().permitAll())
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
