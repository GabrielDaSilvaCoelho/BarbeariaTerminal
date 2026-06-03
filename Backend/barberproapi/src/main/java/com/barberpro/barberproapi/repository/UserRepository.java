package com.barberpro.barberproapi.repository;

import com.barberpro.barberproapi.domain.User;
import com.barberpro.barberproapi.domain.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRoleInOrderByNomeAsc(Collection<UserRole> roles);
}
