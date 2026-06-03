package com.barberpro.barberproapi.service;

import com.barberpro.barberproapi.domain.BarberService;
import com.barberpro.barberproapi.dto.BarberServiceRequest;
import com.barberpro.barberproapi.dto.BarberServiceResponse;
import com.barberpro.barberproapi.exception.BusinessException;
import com.barberpro.barberproapi.repository.BarberServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BarberServiceService {

    private final BarberServiceRepository repository;

    public List<BarberServiceResponse> listAll() {
        return repository.findByAtivoTrueOrderByIdDesc()
                .stream()
                .map(BarberServiceResponse::from)
                .toList();
    }

    @Transactional
    public BarberServiceResponse create(BarberServiceRequest request) {
        validarNome(request.nome());

        BarberService service = BarberService.builder()
                .nome(request.nome().trim())
                .descricao(normalize(request.descricao()))
                .preco(request.preco())
                .duracaoMin(request.duracaoMin())
                .ativo(true)
                .build();

        return BarberServiceResponse.from(repository.save(service));
    }

    @Transactional
    public BarberServiceResponse update(Long id, BarberServiceRequest request) {
        validarNome(request.nome());

        BarberService service = repository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Serviço não encontrado."));

        service.setNome(request.nome().trim());
        service.setDescricao(normalize(request.descricao()));
        service.setPreco(request.preco());
        service.setDuracaoMin(request.duracaoMin());
        service.setAtivo(request.ativo() == null || request.ativo());

        return BarberServiceResponse.from(repository.save(service));
    }

    @Transactional
    public BarberServiceResponse remove(Long id) {
        BarberService service = repository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Serviço não encontrado."));

        service.setAtivo(false);
        return BarberServiceResponse.from(repository.save(service));
    }

    private void validarNome(String nome) {
        if (nome == null || nome.trim().length() < 3) {
            throw BusinessException.badRequest("O nome do serviço deve ter pelo menos 3 caracteres.");
        }
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
