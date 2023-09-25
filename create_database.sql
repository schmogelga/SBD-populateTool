create table semestre (cod_semestre integer, ano integer, letra varchar(1));
alter table semestre add primary key (cod_semestre);

create table materia (cod_materia integer, nome varchar(50));
alter table materia add primary key (cod_materia);

create table resultado (cod_resultado integer, resultado integer, cod_materia integer, cod_semestre integer);
alter table resultado add primary key (cod_resultado);
alter table resultado add foreign key (cod_materia) references materia;
alter table resultado add foreign key (cod_semestre) references semestre;

create table aluno (cod_aluno integer, nome varchar(50), endereco varchar(50), data_nasc date, cpf char(14), rg char(10), cod_resultado integer);
alter table aluno add primary key (cod_aluno);
alter table aluno add foreign key (cod_resultado) references resultado;

create table professor (cod_prof integer, nome varchar(50), endereco varchar(50), fone varchar(15), primary key (cod_prof));

create table turma (cod_turma integer, descricao varchar(50), curso varchar(50), data_inicio date, cod_prof integer);
alter table turma add primary key (cod_turma);
alter table turma add foreign key (cod_prof) references professor;

create table contrato (cod_contrato integer, cod_aluno integer, cod_turma integer, valor real, primary key (cod_contrato), cod_semestre integer);
alter table contrato add foreign key (cod_aluno) references aluno;
alter table contrato add foreign key (cod_turma) references turma;
alter table contrato add foreign key (cod_semestre) references semestre;


create table parcela (cod_contrato integer, data_vcto date, valor_parcela real, data_pgto date, valor_pago real);
alter table parcela add primary key (cod_contrato,data_vcto);
alter table parcela add foreign key (cod_contrato) references contrato;

create table ocorrencia (cod_turma integer, dia_semana char(3), primary key (cod_turma,dia_semana));
alter table ocorrencia add foreign key (cod_turma) references turma;

create table aula (cod_turma integer, data_aula date, cod_prof integer, materia varchar(50), num_horas real, cod_materia integer);
alter table aula add primary key (cod_turma,data_aula);
alter table aula add foreign key (cod_turma) references turma;
alter table aula add foreign key (cod_prof) references professor;
alter table aula add foreign key (cod_materia) references materia;

create table prova (cod_prova integer, data_prova date, cod_turma integer, assunto varchar(50), peso real, cod_materia integer);
alter table prova add primary key (cod_prova);
alter table prova add foreign key (cod_turma) references turma;
alter table prova add foreign key (cod_materia) references materia;

create table nota (cod_prova integer, cod_aluno integer, nota real, primary key (cod_prova,cod_aluno));
alter table nota add foreign key (cod_prova) references prova;
alter table nota add foreign key (cod_aluno) references aluno;

create table presenca (cod_turma integer, data_aula date, cod_aluno integer);
alter table presenca add primary key (cod_turma,data_aula,cod_aluno);
alter table presenca add foreign key (cod_turma,data_aula) references aula;
alter table presenca add foreign key (cod_aluno) references aluno;

