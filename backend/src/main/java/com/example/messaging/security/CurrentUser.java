package com.example.messaging.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Inject the authenticated user's userId (Long) directly into a controller method
 * parameter, resolved from the JWT stored in SecurityContext. Usage:
 *   public ResponseEntity<X> foo(@CurrentUser Long userId) { ... }
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser {
}
