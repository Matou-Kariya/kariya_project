package org.kariya.auth.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.kariya.auth.service.LoginUserDetailsService;
import org.kariya.auth.service.TokenVersionService;
import org.kariya.constant.Constants;
import org.kariya.utils.JwtTokenUtil;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenUtil jwtTokenUtil;
    private final LoginUserDetailsService loginUserDetailsService;
    private final StringRedisTemplate stringRedisTemplate;
    private final TokenVersionService tokenVersionService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = resolveToken(request);
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }
        try {
            Claims claims = jwtTokenUtil.parseToken(token);
            if (!"access".equals(claims.get("type", String.class))) {
                throw new JwtException("Invalid token type");
            }
            String jti = claims.getId();
            if (Boolean.TRUE.equals(stringRedisTemplate.hasKey(Constants.accessBlacklistKey(jti)))) {
                throw new JwtException("Token blacklisted");
            }
            Long userId = Long.valueOf(claims.getSubject());
            Integer tokenVersion = claims.get("tokenVersion", Integer.class);
            Integer currentVersion = tokenVersionService.getCurrentTokenVersion(userId);
            if (!currentVersion.equals(tokenVersion)) {
                throw new JwtException("Token version changed");
            }
            String username = claims.get("username", String.class);
            UserDetails userDetails = loginUserDetailsService.loadUserByUsername(username);
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails,
                    null, userDetails.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            filterChain.doFilter(request, response);
        } catch (JwtException | IllegalArgumentException e) {
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.getWriter().write("""
                    {"code":401,"message":"登录已过期，请重新登录","data":null}
                    """);
        }
    }

    private String resolveToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }
        return authorization.substring(7);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return "/auth/login".equals(path) || "/auth/refresh".equals(path);
    }

}