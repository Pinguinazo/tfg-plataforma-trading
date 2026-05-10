pipeline {
    agent any
    stages {
        stage('1. Clono el código') {
            steps { checkout scm }
        }
        stage('2. Comprobar estructura Docker') {
            steps { sh 'docker-compose -f Cassandra/docker-compose.yml config' }
        }
        stage('3. Levantar Servicios') {
            steps {
                sh 'docker-compose -f Cassandra/docker-compose.yml down --remove-orphans || true'
                sh 'docker-compose -f Cassandra/docker-compose.yml up -d --build'
            }
        }
       stage('4. Verificación de Salud') {
            steps {
                sh '''
                    echo "Esperando a que los contenedores reporten estado HEALTHY..."
                    
                    # Esperar a que la API esté Healthy (Docker ya hace el curl por nosotros)
                    until [ "$(docker inspect -f '{{.State.Health.Status}}' node_api_tfg)" = "healthy" ]; do
                        STATUS=$(docker inspect -f '{{.State.Status}}' node_api_tfg)
                        if [ "$STATUS" = "exited" ]; then
                            echo "ERROR: El contenedor se ha detenido."
                            docker logs node_api_tfg
                            exit 1
                        fi
                        echo "Todavía arrancando... (Estado actual: $STATUS)"
                        sleep 5
                    done
                    
                    echo "Servicios verificados"
                '''
            }
        }
       stage('5. Pruebas CRUD') {
            steps {
                sh '''
                    echo "Esperando 10s para la propagación del Keyspace y tablas..."
                    sleep 10
                    
                    # 1. Registro de usuario
                    # Ejecutamos el curl desde dentro del contenedor para máxima fiabilidad
                    RES_CREATE=$(docker exec node_api_tfg curl -s -X POST http://192.168.1.77:3002/api/users/register \
                        -H "Content-Type: application/json" \
                        -d '{"username":"test_user","email":"test@test.com","password":"123","tier":"Básico"}')
                    
                    echo "Respuesta Registro: $RES_CREATE"
                    
                    if echo "$RES_CREATE" | grep -q "Usuario registrado"; then
                        echo "Registro comprobado"
                    else
                        echo "FALLO EN REGISTRO. Logs de la API:"
                        docker logs node_api_tfg
                        exit 1
                    fi
                    
                    # Extraer ID del usuario creado
                    USER_ID=$(echo "$RES_CREATE" | grep -o '"user_id":"[^"]*' | cut -d'"' -f4)
                    echo "ID de usuario extraído: $USER_ID"

                    # 2. Prueba de Login
                    echo "Probando Login..."
                    docker exec node_api_tfg curl -s -f -X POST http://192.168.1.77:3002/api/users/login \
                        -H "Content-Type: application/json" \
                        -d '{"email":"test@test.com","password":"123"}' && echo "Login comprobado"

                    # 3. Registro de Transacción
                    echo "Registrando trade de prueba..."
                    docker exec node_api_tfg curl -s -f -X POST http://192.168.1.77:3002/api/trade \
                        -H "Content-Type: application/json" \
                        -d "{\\"user_id\\":\\"$USER_ID\\", \\"type\\":\\"BUY\\", \\"symbol\\":\\"BTC\\", \\"ticker\\":\\"BTC\\", \\"amount\\":1, \\"price\\":50000, \\"balance\\": 99950000, \\"holdings\\": {\\"BTC\\": [{\\"id\\": \\"123\\", \\"amount\\": 1, \\"buyPrice\\": 50000, \\"ticker\\": \\"BTC\\"}]} }" && echo "✅ Transacción guardada"

                    echo "Pruebas sobre Cassandra completadas"
                '''
            }
        }
    }
    post {
        always { sh 'docker-compose -f Cassandra/docker-compose.yml down || true' }
    }
}