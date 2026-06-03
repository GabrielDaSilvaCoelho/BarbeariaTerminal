package com.barberpro.barberproapi.service;

import com.barberpro.barberproapi.domain.User;
import com.barberpro.barberproapi.domain.UserRole;
import com.barberpro.barberproapi.dto.UserResponse;
import com.barberpro.barberproapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserResponse> listBarbeirosEAdmins() {
        return userRepository.findByRoleInOrderByNomeAsc(List.of(UserRole.ADMIN, UserRole.BARBEIRO))
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse me(User user) {
        return UserResponse.from(user);
    }
}
