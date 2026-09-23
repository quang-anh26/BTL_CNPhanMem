package com.example.messaging.controller;

import com.example.messaging.security.CurrentUser;
import com.example.messaging.service.BlockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/blocks")
@RequiredArgsConstructor
public class BlockController {

    private final BlockService blockService;

    @PostMapping("/{userId}")
    public ResponseEntity<Void> block(@CurrentUser Long me, @PathVariable Long userId) {
        blockService.block(me, userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> unblock(@CurrentUser Long me, @PathVariable Long userId) {
        blockService.unblock(me, userId);
        return ResponseEntity.noContent().build();
    }
}
