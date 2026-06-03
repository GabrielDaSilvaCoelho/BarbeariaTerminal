package com.barberpro.barberproapi.controller;

import com.barberpro.barberproapi.dto.UserResponse;
import com.barberpro.barberproapi.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/barbeiros")
    public List<UserResponse> listBarbeirosEAdmins() {
        return userService.listBarbeirosEAdmins();
    }
}
